import type { ScoreOption } from '@/types/assessment';

interface QuestionCardProps {
  option: ScoreOption;
  selected: boolean;
  onSelect: () => void;
}

export function QuestionCard({ option, selected, onSelect }: QuestionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'flex w-full items-center gap-4 rounded-lg border px-4 py-3 text-left transition',
        selected
          ? 'border-brand-purple bg-brand-purple/15 shadow-[0_0_0_1px_#7030A0]'
          : 'border-brand-border bg-brand-surface hover:border-brand-purple/60',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-lg font-bold',
          selected ? 'bg-brand-purple text-white' : 'bg-brand-border text-brand-purple-light',
        ].join(' ')}
      >
        {option.value}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-white">{option.label}</span>
        <span className="text-xs text-brand-muted">{option.description}</span>
      </span>
    </button>
  );
}
