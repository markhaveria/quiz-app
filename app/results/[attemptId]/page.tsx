import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuestionIndicators from "@/app/components/QuestionIndicators";

export const dynamic = "force-dynamic";

type ResultsPageProps = { params: Promise<{ attemptId: string }> };

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { attemptId } = await params;
  const id = Number(attemptId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id },
    include: {
      quiz: true,
      answers: { orderBy: { questionId: "asc" }, select: { questionId: true, isCorrect: true } },
    },
  });
  if (!attempt) notFound();

  const passed = attempt.percentage >= 60;
  return (
    <main className="min-h-screen px-5 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-medium text-blue-700 hover:text-blue-900">← My Quiz App</Link>
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase text-blue-700">Quiz completed!</p>
          <h1 className="mt-3 text-3xl font-bold">{attempt.quiz.title}</h1>
          <p className="mt-2 text-slate-600">Quiz history for {attempt.userName}</p>
          <div className="mt-5 flex justify-center">
            <QuestionIndicators statuses={attempt.answers.map((answer) => answer.isCorrect ? "correct" : "incorrect")} />
          </div>
          <div className="mx-auto mt-8 inline-flex min-w-40 flex-col items-center rounded-2xl bg-blue-50 px-7 py-5">
            <strong className="text-4xl text-blue-800">{attempt.score} / {attempt.totalQuestions}</strong>
            <span className="mt-1 text-sm text-slate-600">Final score</span>
          </div>
          <p className={`mt-5 text-base font-medium ${passed ? "text-emerald-700" : "text-slate-600"}`}>
            {passed ? "Great work, you’ve got this." : "Keep practicing. You’re building momentum."}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 border-y border-slate-100 py-5 text-center">
            <div><strong className="block text-2xl text-emerald-700">{attempt.correctAnswers}</strong><span className="text-sm text-slate-500">Correct</span></div>
            <div><strong className="block text-2xl text-rose-700">{attempt.incorrectAnswers}</strong><span className="text-sm text-slate-500">Wrong</span></div>
            <div><strong className="block text-2xl text-blue-800">{attempt.percentage}%</strong><span className="text-sm text-slate-500">Percentage</span></div>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/setup?name=${encodeURIComponent(attempt.userName)}`} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">Try Again</Link>
            <Link href={`/results?name=${encodeURIComponent(attempt.userName)}`} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">My History</Link>
            <Link href="/" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">Back to Home</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
