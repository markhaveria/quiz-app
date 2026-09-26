import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#202833] px-4 text-white">
      <section className="flex flex-col items-center text-center">
        <h1
          className="text-[6rem] font-black leading-none text-[#ff9f0a] sm:text-[7rem]"
          style={{ textShadow: "0 5px 0 #bd6500, 0 16px 28px rgb(0 0 0 / 0.35)" }}
        >
          Let's QUIZ!
        </h1>
      </section>
      <Link
        href="/results"
        className="absolute bottom-6 right-5 rounded-md px-3 py-3 text-sm font-medium text-slate-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 sm:bottom-8 sm:right-8"
      >
        Quiz History
      </Link>
      <Link
        href="/setup"
        className="absolute bottom-6 left-5 rounded-xl bg-[#ff9f0a] px-5 py-3 font-bold text-[#202833] shadow-[0_4px_0_#bd6500] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 active:translate-y-0 sm:bottom-8 sm:left-8"
      >
        Start Quiz
      </Link>
    </main>
  );
}