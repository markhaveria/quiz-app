import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ResultsPageProps = { params: Promise<{ attemptId: string }> };

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { attemptId } = await params;
  const id = Number(attemptId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id },
    include: { quiz: true },
  });
  if (!attempt) notFound();

  const passed = attempt.percentage >= 60;
  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">Back to quizzes</Link>
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center md:p-12">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">Quiz completed</p>
          <h1 className="mt-4 text-4xl font-bold">{attempt.quiz.title}</h1>
          <div className="mx-auto mt-10 flex h-40 w-40 flex-col items-center justify-center rounded-full border-8 border-violet-400/30 bg-violet-400/10 shadow-[0_0_50px_rgb(139_92_246_/_0.18)]">
            <strong className="text-4xl">{attempt.percentage}%</strong>
            <span className="mt-1 text-sm text-slate-400">score</span>
          </div>
          <p className={`mt-6 text-lg font-semibold ${passed ? "text-emerald-300" : "text-rose-300"}`}>
            {passed ? "Passed" : "Keep practicing"}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/5 p-4"><strong className="block text-2xl">{attempt.score}/{attempt.totalQuestions}</strong><span className="text-xs text-slate-400">Score</span></div>
            <div className="rounded-2xl bg-white/5 p-4"><strong className="block text-2xl text-emerald-300">{attempt.correctAnswers}</strong><span className="text-xs text-slate-400">Correct</span></div>
            <div className="rounded-2xl bg-white/5 p-4"><strong className="block text-2xl text-rose-300">{attempt.incorrectAnswers}</strong><span className="text-xs text-slate-400">Incorrect</span></div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/results/${attempt.id}/review`} className="rounded-xl bg-violet-300 px-5 py-3 font-semibold text-[#180d2d] hover:bg-violet-200">Review answers</Link>
            <Link href={`/quiz/${attempt.quizId}`} className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-slate-200 hover:border-white/30">Retake quiz</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
