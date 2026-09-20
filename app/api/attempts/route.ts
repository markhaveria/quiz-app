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
      answers?: SubmittedAnswer[];
    };
    const quizId = Number(body.quizId);

    if (!Number.isInteger(quizId) || quizId <= 0 || !Array.isArray(body.answers)) {
      return NextResponse.json({ error: "Invalid quiz submission." }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { choices: true },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!quiz || !quiz.published) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    if (quiz.questions.length === 0 || body.answers.length !== quiz.questions.length) {
      return NextResponse.json({ error: "Please answer every question." }, { status: 400 });
    }

    const submittedByQuestion = new Map<number, number>();
    for (const answer of body.answers) {
      const questionId = Number(answer.questionId);
      const choiceId = Number(answer.choiceId);
      if (!Number.isInteger(questionId) || !Number.isInteger(choiceId) || submittedByQuestion.has(questionId)) {
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

      if (!correctChoice || !selectedChoice || selectedChoiceId === undefined) {
        throw new Error("Quiz data is incomplete.");
      }

      return {
        questionId: question.id,
        selectedChoiceId,
        correctChoiceId: correctChoice.id,
        isCorrect: selectedChoiceId === correctChoice.id,
      };
    });

    const correctAnswers = scoredAnswers.filter((answer) => answer.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
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
      results: scoredAnswers.map((answer) => ({
        questionId: answer.questionId,
        isCorrect: answer.isCorrect,
      })),
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to submit this quiz." }, { status: 500 });
  }
}
