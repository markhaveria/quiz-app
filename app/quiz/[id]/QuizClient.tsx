"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QuestionIndicators from "@/app/components/QuestionIndicators";

type Choice = { id: number; text: string };
type Question = { id: number; text: string; choices: Choice[] };

export default function QuizClient({ quiz, userName }: { quiz: { id: number; title: string }; userName: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadQuestions() {
      try {
        const response = await fetch(`/api/questions?quizId=${quiz.id}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Unable to load questions.");
        if (!Array.isArray(result) || result.length !== 10) {
          throw new Error("This quiz needs 10 questions before it can be started.");
        }
        if (isActive) setQuestions(result as Question[]);
      } catch (loadError) {
        if (isActive) setError(loadError instanceof Error ? loadError.message : "Unable to load questions.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadQuestions();
    return () => { isActive = false; };
  }, [quiz.id]);

  async function submitQuiz() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          userName,
          answers: questions.map((question) => ({
            questionId: question.id,
            choiceId: answers[question.id] ?? null,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to submit this quiz.");
      router.push(`/results/${result.attemptId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit this quiz.");
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <p className="py-20 text-center text-slate-600">Loading your questions…</p>;

  if (error && questions.length === 0) {
    return (
      <section className="mt-12 rounded-2xl border border-rose-200 bg-white p-6">
        <p role="alert" className="text-rose-800">{error}</p>
        <Link href="/setup" className="mt-4 inline-block font-semibold text-blue-700">Back to setup</Link>
      </section>
    );
  }

  const question = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <>
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm font-semibold text-blue-700">My Quiz App</Link>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{quiz.title}</h1>
        </div>
        <Link href="/setup" className="text-sm font-medium text-slate-500 hover:text-slate-900">Exit quiz</Link>
      </header>

      <div className="mb-6 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{isReviewing ? "Review your answers" : `Question ${currentIndex + 1} of ${questions.length}`}</span>
        <span className="text-slate-500">{answeredCount} of {questions.length} answered</span>
      </div>
      <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-200" aria-label="Quiz progress">
        <div className="h-full rounded-full bg-blue-700 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="mb-5">
        <QuestionIndicators
          statuses={questions.map((item, index) => index === currentIndex ? "current" : answers[item.id] === undefined ? "unanswered" : "answered")}
          onSelect={setCurrentIndex}
        />
      </div>

      {isReviewing ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">Check your answers</h2>
          <p className="mt-2 text-sm text-slate-600">Select any question to make a change before submitting.</p>
          <ol className="mt-6 divide-y divide-slate-100">
            {questions.map((item, index) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-4">
                <span className="font-medium text-slate-800">Question {index + 1}</span>
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${answers[item.id] === undefined ? "text-amber-700" : "text-emerald-700"}`}>{answers[item.id] === undefined ? "Not answered" : "Answered"}</span>
                  <button type="button" onClick={() => { setCurrentIndex(index); setIsReviewing(false); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">Edit</button>
                </div>
              </li>
            ))}
          </ol>
          {error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}
          <div className="mt-6 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
            <button type="button" onClick={() => { setCurrentIndex(questions.length - 1); setIsReviewing(false); }} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">Back to quiz</button>
            <button type="button" disabled={isSubmitting} onClick={submitQuiz} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{isSubmitting ? "Submitting…" : "Submit Quiz"}</button>
          </div>
        </section>
      ) : question ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8" key={question.id}>
          <h2 className="text-xl font-bold leading-relaxed sm:text-2xl">{question.text}</h2>
          <div className="mt-7 grid gap-3">
            {question.choices.map((choice, index) => {
              const selected = answers[question.id] === choice.id;
              return (
                <button key={choice.id} type="button" onClick={() => setAnswers((current) => ({ ...current, [question.id]: choice.id }))} aria-pressed={selected}
                  className={`flex min-h-14 items-center gap-4 rounded-xl border p-4 text-left transition duration-150 active:scale-[0.99] ${selected ? "border-blue-700 bg-blue-50 text-blue-950 ring-2 ring-blue-100" : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50"}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${selected ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"}`}>{String.fromCharCode(65 + index)}</span>
                  <span>{choice.text}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
            <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            {currentIndex === questions.length - 1 ? (
              <button type="button" onClick={() => setIsReviewing(true)} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">Review Answers</button>
            ) : (
              <button type="button" onClick={() => setCurrentIndex((index) => index + 1)} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">Next</button>
            )}
          </div>
        </section>
      ) : null}
    </>
  );
}