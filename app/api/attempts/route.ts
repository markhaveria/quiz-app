import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SubmittedAnswer = {
  questionId?: unknown;
  choiceId?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      quizId?: unknown;
      userName?: unknown;
      answers?: SubmittedAnswer[];
    };
    const quizId = Number(body.quizId);
    const userName = typeof body.userName === "string" ? body.userName.trim() : "";

    if (!Number.isInteger(quizId) || quizId <= 0 || userName.length === 0 || userName.length > 40 || !Array.isArray(body.answers)) {
      return NextResponse.json({ error: "Invalid quiz submission." }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            choices: {
              orderBy: { id: "asc" },
              take: 3,
            },
          },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!quiz || !quiz.published) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    if (quiz.questions.length === 0 || body.answers.length !== quiz.questions.length) {
      return NextResponse.json({ error: "Answers do not match this quiz." }, { status: 400 });
    }

    const submittedByQuestion = new Map<number, number | null>();
    for (const answer of body.answers) {
      const questionId = Number(answer.questionId);
      const choiceId = answer.choiceId === null ? null : Number(answer.choiceId);
      if (
        !Number.isInteger(questionId) ||
        (choiceId !== null && !Number.isInteger(choiceId)) ||
        submittedByQuestion.has(questionId)
      ) {
        return NextResponse.json({ error: "Invalid or duplicate answer." }, { status: 400 });
      }
      submittedByQuestion.set(questionId, choiceId);
    }

    const quizQuestionIds = new Set(quiz.questions.map((question) => question.id));
    if (
      submittedByQuestion.size !== quizQuestionIds.size ||
      [...submittedByQuestion.keys()].some((questionId) => !quizQuestionIds.has(questionId))
    ) {
      return NextResponse.json({ error: "Answers do not match this quiz." }, { status: 400 });
    }

    const scoredAnswers = quiz.questions.map((question) => {
      const selectedChoiceId = submittedByQuestion.get(question.id);
      const correctChoice = question.choices.find((choice) => choice.isCorrect);
      const selectedChoice = question.choices.find((choice) => choice.id === selectedChoiceId);

      if (!correctChoice || (selectedChoiceId !== null && !selectedChoice) || selectedChoiceId === undefined) {
        throw new Error("Quiz data is incomplete.");
      }

      return {
        questionId: question.id,
        selectedChoiceId,
        correctChoiceId: correctChoice.id,
        isCorrect: selectedChoiceId !== null && selectedChoiceId === correctChoice.id,
      };
    });

    const correctAnswers = scoredAnswers.filter((answer) => answer.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userName,
        totalQuestions,
        correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
        score: correctAnswers,
        percentage: Math.round((correctAnswers / totalQuestions) * 100),
        answers: { create: scoredAnswers },
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.incorrectAnswers,
      percentage: attempt.percentage,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to submit this quiz." }, { status: 500 });
  }
}
