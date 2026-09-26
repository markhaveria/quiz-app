import Link from "next/link";

export type QuestionIndicatorStatus = "correct" | "incorrect" | "current" | "unanswered" | "answered";

type QuestionIndicatorsProps = {
  statuses: QuestionIndicatorStatus[];
  onSelect?: (index: number) => void;
  hrefs?: string[];
};

const symbols: Record<QuestionIndicatorStatus, string> = {
  correct: "✓",
  incorrect: "✗",
  current: "●",
  unanswered: "○",
  answered: "•",
};

const colors: Record<QuestionIndicatorStatus, string> = {
  correct: "text-emerald-700",
  incorrect: "text-rose-700",
  current: "text-blue-700",
  unanswered: "text-slate-400",
  answered: "text-slate-600",
};

export default function QuestionIndicators({ statuses, onSelect, hrefs }: QuestionIndicatorsProps) {
  return (
    <ol aria-label="Question status" className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      {statuses.map((status, index) => {
        const description = status === "answered" ? "answered, score pending" : status;
        const label = `Question ${index + 1}: ${description}`;
        const marker = status === "correct" || status === "incorrect" ? (
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${status === "correct" ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"}`}>
            <span aria-hidden="true" className={`flex h-8 w-8 items-center justify-center rounded-md text-2xl font-bold leading-none text-white ${status === "correct" ? "bg-emerald-500" : "bg-rose-500"}`}>
              {symbols[status]}
            </span>
          </span>
        ) : (
          <span aria-hidden="true" className={`text-base font-bold leading-none ${colors[status]}`}>{symbols[status]}</span>
        );

        return (
          <li key={index}>
            {onSelect ? (
              <button type="button" aria-label={label} title={label} onClick={() => onSelect(index)} className="flex h-11 min-w-11 items-center justify-center rounded-xl hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700">
                {marker}
              </button>
            ) : hrefs?.[index] ? (
              <Link href={hrefs[index]} aria-label={label} title={label} className="flex h-11 min-w-11 items-center justify-center rounded-xl hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700">
                {marker}
              </Link>
            ) : (
              <span aria-label={label} title={label} className="flex h-11 min-w-11 items-center justify-center">{marker}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}