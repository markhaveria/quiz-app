import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResultsHistoryPage() {
  const attempts = await prisma.quizAttempt.findMany({
    orderBy: { completedAt: "desc" },
    include: { quiz: true },
  });

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm text-slate-400 hover:text-white">Back to quizzes</Link>
            <h1 className="mt-6 text-4xl font-bold">Quiz history</h1>
            <p className="mt-2 text-slate-400">Review your previous attempts and scores.</p>
          </div>
        </div>
        {attempts.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-slate-400">
            No quiz attempts yet.
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {attempts.map((attempt) => (
              <Link
                key={attempt.id}
                href={`/results/${attempt.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_14px_40px_rgb(0_0_0_/_0.12)] transition hover:border-violet-300/50 hover:bg-violet-300/[0.06] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="font-semibold">{attempt.quiz.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {attempt.score}/{attempt.totalQuestions} correct · {attempt.completedAt.toLocaleString()}
                  </p>
                </div>
                <span className="text-2xl font-bold text-violet-300">{attempt.percentage}%</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
