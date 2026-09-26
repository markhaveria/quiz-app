"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type QuizOption = { id: number; title: string; description: string | null };

export default function SetupClient({ quizzes, initialUserName }: { quizzes: QuizOption[]; initialUserName: string }) {
  const router = useRouter();
  const [quizId, setQuizId] = useState(quizzes[0]?.id.toString() ?? "");
  const [userName, setUserName] = useState(initialUserName);

  function startQuiz() {
    const normalizedName = userName.trim();
    if (!normalizedName || normalizedName.length > 40) return;
    router.push(`/quiz/${quizId}?name=${encodeURIComponent(normalizedName)}`);
  }

  return (
    <main className="min-h-screen px-5 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-medium text-blue-700 hover:text-blue-900">← Home</Link>
        <p className="mt-12 text-sm font-semibold uppercase text-blue-700">Quiz setup</p>
        <h1 className="mt-3 text-4xl font-bold">Choose your quiz</h1>
        <p className="mt-3 text-slate-600">You’ll have 10 questions. Take your time and review before submitting.</p>
        <label htmlFor="user-name" className="mt-7 block text-sm font-semibold">Your name</label>
        <input
          id="user-name"
          maxLength={40}
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          placeholder="Enter a name for your quiz history"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
        <p className="mt-2 text-xs text-slate-500">Display name only. No account or password is used.</p>
        {userName.trim() && (
          <Link href={`/results?name=${encodeURIComponent(userName.trim())}`} className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900">
            View {userName.trim()}&apos;s quiz history
          </Link>
        )}

        {quizzes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-semibold">No quizzes are available yet.</p>
            <p className="mt-2 text-sm text-slate-600">Seed the database with sample questions, then try again.</p>
          </div>
        ) : (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <label htmlFor="quiz-title" className="block text-sm font-semibold">Quiz title</label>
            <select
              id="quiz-title"
              value={quizId}
              onChange={(event) => setQuizId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              {quizzes.map((quiz) => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}
            </select>
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
              <div>
                <p className="font-semibold">Number of questions</p>
                <p className="mt-1 text-sm text-slate-500">10 questions</p>
              </div>
              <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">10</span>
            </div>
            <button
              type="button"
              disabled={!quizId || !userName.trim() || userName.trim().length > 40}
              onClick={startQuiz}
              className="mt-8 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start Quiz
            </button>
          </section>
        )}
      </div>
    </main>
  );
}