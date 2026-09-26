import { prisma } from "@/lib/prisma";
import SetupClient from "./SetupClient";

export const dynamic = "force-dynamic";

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ name?: string }> }) {
  const { name } = await searchParams;
  const quizzes = await prisma.quiz.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, description: true },
  });

  return <SetupClient quizzes={quizzes} initialUserName={name ?? ""} />;
}