import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResultsHistoryPage({ searchParams }: { searchParams: Promise<{ name?: string }> }) {
  const { name: requestedName } = await searchParams;
  const userName = requestedName?.trim().slice(0, 40) ?? "";
  const attempts = await prisma.quizAttempt.findMany({
    where: userName ? { userName: { equals: userName, mode: "insensitive" } } : undefined,
    orderBy: { completedAt: "desc" },
    include: { quiz: true },
  });

  return (
    <main className="min-h-screen px-5 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm font-medium text-blue-700 hover:text-blue-900">← My Quiz App</Link>
            <h1 className="mt-6 text-4xl font-bold">{userName ? `${userName}'s quiz history` : "Quiz history"}</h1>
            <p className="mt-2 text-slate-600">Find saved attempts by the display name used when submitting.</p>
          </div>
        </div>
        <form action="/results" className="mt-7 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="history-name" className="sr-only">Name</label>
          <input id="history-name" name="name" maxLength={40} defaultValue={userName} placeholder="Enter a display name" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
          <button type="submit" className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">Find history</button>
        </form>
        {attempts.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            {userName ? `No quiz attempts found for ${userName}.` : "No quiz attempts yet."}
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {attempts.map((attempt) => (
              <Link
                key={attempt.id}
                href={`/results/${attempt.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="font-semibold">{attempt.quiz.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {attempt.score}/{attempt.totalQuestions} correct · {attempt.userName} · {attempt.completedAt.toLocaleString()}
                  </p>
                </div>
                <span className="text-2xl font-bold text-blue-800">{attempt.percentage}%</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
