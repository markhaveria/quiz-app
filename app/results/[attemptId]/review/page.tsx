import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ReviewPageProps = { params: Promise<{ attemptId: string }> };

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { attemptId } = await params;
  const id = Number(attemptId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id },
    include: {
      quiz: true,
      answers: {
        include: { question: true, selectedChoice: true, correctChoice: true },
        orderBy: { questionId: "asc" },
      },
    },
  });
  if (!attempt) notFound();

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href={`/results/${attempt.id}`} className="text-sm text-slate-400 hover:text-white">Back to results</Link>
        <h1 className="mt-8 text-4xl font-bold">Review answers</h1>
        <p className="mt-2 text-slate-400">{attempt.quiz.title}</p>
        <div className="mt-8 space-y-4">
          {attempt.answers.map((answer, index) => (
            <article key={answer.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm font-medium text-violet-300">Question {index + 1}</p>
              <h2 className="mt-2 text-xl font-semibold">{answer.question.text}</h2>
              <div className="mt-5 grid gap-2 text-sm">
                <p className="text-slate-300">Your answer: <span className={answer.isCorrect ? "text-emerald-300" : "text-rose-300"}>{answer.selectedChoice?.text ?? "No answer"}</span></p>
                {!answer.isCorrect && <p className="text-slate-300">Correct answer: <span className="text-emerald-300">{answer.correctChoice.text}</span></p>}
              </div>
              {answer.question.explanation && <p className="mt-4 border-t border-white/10 pt-4 text-sm text-slate-400">{answer.question.explanation}</p>}
              <p className={`mt-4 text-sm font-semibold ${answer.isCorrect ? "text-emerald-300" : "text-rose-300"}`}>{answer.isCorrect ? "Correct" : "Incorrect"}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
