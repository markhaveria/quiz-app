import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: { quiz: { published: true } },
      orderBy: { id: "asc" },
      take: 10,
      select: {
        id: true,
        text: true,
        points: true,
        choices: {
          orderBy: { id: "asc" },
          select: { id: true, text: true },
        },
      },
    });

    return NextResponse.json(questions);
  } catch {
    return NextResponse.json({ error: "Unable to load questions." }, { status: 500 });
  }
}
