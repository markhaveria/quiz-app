import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Answer checking is available only after quiz submission." },
    { status: 410 },
  );
}