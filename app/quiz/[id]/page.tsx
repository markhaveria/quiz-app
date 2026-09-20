import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuizClient from "./QuizClient";

export const dynamic = "force-dynamic";

type QuizPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function QuizPage({
  params,
}: QuizPageProps) {
  const { id } = await params;

  const quizId = Number(id);

  if (Number.isNaN(quizId)) {
    notFound();
  }

  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      questions: {
        orderBy: {
          id: "asc",
        },
        include: {
          choices: {
            orderBy: {
              id: "asc",
            },
            select: {
              id: true,
              text: true,
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <QuizClient quiz={quiz} />
      </div>
    </main>
  );
}