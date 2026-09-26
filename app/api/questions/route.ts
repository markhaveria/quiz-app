import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const requestedQuizId = new URL(request.url).searchParams.get("quizId");
    const quizId = requestedQuizId === null ? undefined : Number(requestedQuizId);

    if (requestedQuizId !== null && (!Number.isInteger(quizId) || Number(quizId) <= 0)) {
      return NextResponse.json({ error: "Invalid quiz." }, { status: 400 });
    }

    const questions = await prisma.question.findMany({
      where: {
        quiz: {
          published: true,
          ...(quizId === undefined ? {} : { id: quizId }),
        },
      },
      orderBy: { id: "asc" },
      take: 10,
      select: {
        id: true,
        text: true,
        points: true,
        choices: {
          orderBy: { id: "asc" },
          take: 3,
          select: { id: true, text: true },
        },
      },
    });

    return NextResponse.json(questions);
  } catch {
    return NextResponse.json({ error: "Unable to load questions." }, { status: 500 });
  }
}
