import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuizClient from "./QuizClient";

export const dynamic = "force-dynamic";

type QuizPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ name?: string }>;
};

export default async function QuizPage({
  params,
  searchParams,
}: QuizPageProps) {
  const [{ id }, { name }] = await Promise.all([params, searchParams]);

  const quizId = Number(id);

  if (Number.isNaN(quizId)) {
    notFound();
  }

  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    select: { id: true, title: true, published: true },
  });

  if (!quiz || !quiz.published) {
    notFound();
  }

  return (
    <main className="min-h-screen px-5 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <QuizClient quiz={{ id: quiz.id, title: quiz.title }} userName={name?.trim().slice(0, 40) ?? ""} />
      </div>
    </main>
  );
}