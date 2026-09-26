import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const quizzes = await prisma.quiz.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      questions: true,
    },
  });

  return (
    <main className="min-h-screen bg-transparent text-white">
      
      <nav className="border-b border-violet-200/10 bg-[#090716]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Quiz<span className="text-violet-300">Lab</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-slate-300">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>

            <Link href="/results" className="transition hover:text-white">
              My Results
            </Link>
          </div>
        </div>
      </nav>

    
      <section className="relative overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
              <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_14px_theme(colors.violet.300)]" />
              Learn • Challenge • Improve
            </p>

            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Challenge your
              <span className="block text-violet-300">
                knowledge.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Test what you know, answer challenging questions, and see how
              much you can improve.
            </p>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Available Quizzes</h2>
          <p className="mt-2 text-slate-400">
            Choose a quiz and start testing your knowledge.
          </p>
        </div>

        {quizzes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <h3 className="text-xl font-semibold">
              No quizzes available
            </h3>

            <p className="mt-2 text-slate-400">
              Add a quiz to your database to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <article
                key={quiz.id}
                className="group rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_60px_rgb(0_0_0_/_0.14)] transition duration-300 hover:-translate-y-1 hover:border-violet-300/40 hover:bg-violet-300/[0.07]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/15 text-xl text-violet-200 ring-1 ring-violet-300/20">
                    ?
                  </div>

                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                    {quiz.difficulty ?? "Practice"}
                  </span>
                </div>

                <h3 className="text-2xl font-bold">
                  {quiz.title}
                </h3>

                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">
                  {quiz.description ?? "Test your knowledge with this interactive quiz."}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-sm text-slate-400">
                    {quiz.category ?? "General"} · {quiz.questions.length} Questions
                  </span>

                  <Link
                    href={`/quiz/${quiz.id}`}
                    className="rounded-xl bg-violet-300 px-4 py-2 text-sm font-semibold text-[#180d2d] shadow-lg shadow-violet-950/30 transition hover:bg-violet-200"
                  >
                    Start Quiz
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          Quiz App © 2026
        </div>
      </footer>
    </main>
  );
}