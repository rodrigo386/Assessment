import type { Answer, Pillar } from '@/types/assessment';

interface CommentsSummaryProps {
  pillars: Pillar[];
  answers: Record<string, Answer>;
}

export function CommentsSummary({ pillars, answers }: CommentsSummaryProps) {
  const items = pillars.flatMap((pillar) =>
    pillar.questions
      .map((q) => ({ pillar, question: q, answer: answers[q.id] }))
      .filter((x) => x.answer?.comment?.trim()),
  );

  if (items.length === 0) return null;

  return (
    <div data-card className="flex flex-col gap-4 rounded-xl border border-brand-border bg-brand-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
        Comentários registrados
      </h3>
      <ul className="flex flex-col gap-3">
        {items.map(({ pillar, question, answer }) => (
          <li
            key={question.id}
            className="border-l-2 border-brand-purple pl-3 text-sm leading-relaxed text-brand-text"
          >
            <div className="text-[11px] uppercase tracking-wider text-brand-muted">
              {pillar.icon} Pergunta {question.id} — {question.text}
            </div>
            <div className="mt-1 text-white">&quot;{answer.comment}&quot;</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
