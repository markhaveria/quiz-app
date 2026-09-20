"use client";

import Link from "next/link";
import { useState } from "react";

type Choice = {
  id: number;
  text: string;
};

type Question = {
  id: number;
  text: string;
  choices: Choice[];
};

type AnswerStatus = Record<number, boolean>;

type QuizClientProps = {
  quiz: {
    id: number;
    title: string;
    questions: Question[];
  };
};

export default function QuizClient({ quiz }: QuizClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [answerStatuses, setAnswerStatuses] = useState<AnswerStatus>({});
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const question = quiz.questions[currentIndex];
  const selectedChoiceId = answers[question.id];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  function selectChoice(choiceId: number) {
    setAnswers((previous) => ({ ...previous, [question.id]: choiceId }));
    setAnswerStatuses((previous) => {
      const next = { ...previous };
      delete next[question.id];
      return next;
    });
    setError(null);
  }

  async function goToNextQuestion() {
    if (selectedChoiceId === undefined) {
      setError("Please select an answer before continuing.");
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/questions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          choiceId: selectedChoiceId,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to check this answer.");
      }

      setAnswerStatuses((previous) => ({
        ...previous,
        [question.id]: result.isCorrect,
      }));
      setCurrentIndex((index) => index + 1);
    } catch (checkError) {
      setError(
        checkError instanceof Error
          ? checkError.message
          : "Unable to check this answer.",
      );
    } finally {
      setIsChecking(false);
    }
  }

  async function submitQuiz() {
    if (answeredCount !== quiz.questions.length) {
      setError("Please answer every question before submitting.");
      return;
    }

    if (!window.confirm("Are you sure you want to submit your quiz?")) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: Object.entries(answers).map(([questionId, choiceId]) => ({
            questionId: Number(questionId),
            choiceId,
          })),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to submit this quiz.");
      }

      setAttemptId(result.attemptId);
      setAnswerStatuses(
        Object.fromEntries(
          result.results.map((item: { questionId: number; isCorrect: boolean }) => [
            item.questionId,
            item.isCorrect,
          ]),
        ),
      );
      setIsComplete(true);
      setIsSubmitting(false);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to submit this quiz.",
      );
      setIsSubmitting(false);
    }
  }

  if (!question) {
    return (
      <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-8 text-amber-100">
        This quiz does not have any questions yet.
      </div>
    );
  }

  const correctCount = Object.values(answerStatuses).filter(Boolean).length;

  if (isComplete && attemptId) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-violet-300">{quiz.title}</p>
            <h1 className="mt-2 text-3xl font-bold">Quiz completed</h1>
          </div>
          <span className="text-2xl font-bold text-violet-300">{correctCount}/{quiz.questions.length}</span>
        </div>

        <div className="mb-8 flex items-center gap-2" aria-label="Quiz results">
          <span className="mr-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Items</span>
          {quiz.questions.map((item, index) => {
            const isCorrect = answerStatuses[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Question ${index + 1}: ${isCorrect ? "correct" : "incorrect"}`}
                className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm font-bold ${
                  isCorrect
                    ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-200"
                    : "border-rose-400/50 bg-rose-400/20 text-rose-200"
                }`}
              >
                {isCorrect ? "✅" : "❌"}
              </button>
            );
          })}
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-slate-300">You got {correctCount} out of {quiz.questions.length} questions correct.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/results/${attemptId}`} className="rounded-xl bg-violet-300 px-5 py-3 font-semibold text-[#180d2d] shadow-lg shadow-violet-950/30 hover:bg-violet-200">View full results</Link>
            <Link href={`/quiz/${quiz.id}`} className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-slate-200 hover:border-white/30">Restart quiz</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet-300">{quiz.title}</p>
          <p className="mt-2 text-slate-400">
            Question {currentIndex + 1} of {quiz.questions.length}
          </p>
        </div>
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          Exit quiz
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-2" aria-label="Quiz progress">
        <span className="mr-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Items</span>
        {quiz.questions.map((item, index) => {
          const answered = answers[item.id] !== undefined;
          const status = answerStatuses[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to question ${index + 1}`}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-bold transition ${
                status === true
                  ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-200"
                  : status === false
                    ? "border-rose-400/50 bg-rose-400/20 text-rose-200"
                    : index === currentIndex
                      ? "border-violet-300 bg-violet-400/20 text-violet-200"
                      : answered
                        ? "border-violet-400/40 bg-violet-400/10 text-violet-200"
                        : "border-white/10 bg-white/5 text-slate-500 hover:border-white/30"
              }`}
            >
              {status === true ? "✅" : status === false ? "❌" : answered ? "•" : ""}
            </button>
          );
        })}
        <span className="ml-auto text-sm font-semibold text-slate-300">{answeredCount}/{quiz.questions.length}</span>
      </div>

      <div className="mb-8 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-violet-400 transition-all shadow-[0_0_18px_rgb(167_139_250_/_0.65)]"
          style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <h1 className="text-2xl font-bold leading-tight md:text-3xl">
          {question.text}
        </h1>

        <div className="mt-8 grid gap-3">
          {question.choices.map((choice, choiceIndex) => {
            const isSelected = selectedChoiceId === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => selectChoice(choice.id)}
                aria-pressed={isSelected}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? "border-violet-400 bg-violet-400/15 text-white shadow-[0_0_22px_rgb(139_92_246_/_0.12)]"
                    : "border-white/10 bg-slate-900/70 text-slate-200 hover:border-violet-400/60 hover:bg-violet-400/10"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 font-bold">
                  {String.fromCharCode(65 + choiceIndex)}
                </span>
                <span>{choice.text}</span>
              </button>
            );
          })}
        </div>
      </section>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
        <button
          type="button"
          disabled={currentIndex === 0 || isSubmitting}
          onClick={() => setCurrentIndex((index) => index - 1)}
          className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-slate-200 transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        {isLastQuestion ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={submitQuiz}
            className="rounded-xl bg-violet-300 px-5 py-3 font-semibold text-[#180d2d] shadow-lg shadow-violet-950/30 transition hover:bg-violet-200 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </button>
        ) : (
          <button
            type="button"
            onClick={goToNextQuestion}
            disabled={isChecking}
            className="rounded-xl bg-violet-300 px-5 py-3 font-semibold text-[#180d2d] shadow-lg shadow-violet-950/30 transition hover:bg-violet-200"
          >
            {isChecking ? "Checking..." : "Next"}
          </button>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-slate-500">
        {correctCount}/{quiz.questions.length} correct
      </p>
    </div>
  );
}
