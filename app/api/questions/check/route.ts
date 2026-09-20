import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      questionId?: unknown;
      choiceId?: unknown;
    };
    const questionId = Number(body.questionId);
    const choiceId = Number(body.choiceId);

    if (!Number.isInteger(questionId) || !Number.isInteger(choiceId)) {
      return NextResponse.json({ error: "Invalid answer." }, { status: 400 });
    }

    const choice = await prisma.choice.findFirst({
      where: {
        id: choiceId,
        questionId,
        question: { quiz: { published: true } },
      },
      select: { isCorrect: true },
    });

    if (!choice) {
      return NextResponse.json({ error: "Answer not found." }, { status: 404 });
    }

    return NextResponse.json({ isCorrect: choice.isCorrect });
  } catch {
    return NextResponse.json({ error: "Unable to check answer." }, { status: 500 });
  }
}
