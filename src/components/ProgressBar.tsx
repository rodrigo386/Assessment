interface ProgressBarProps {
  current: number; // 1-indexed
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, (current / total) * 100));
  return (
    <div className="flex flex-col gap-2" role="group" aria-label="Progresso do assessment">
      <div className="flex items-center justify-between text-xs text-brand-muted" aria-live="polite">
        <span>
          Pergunta <strong className="text-white">{current}</strong> de {total}
        </span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-border">
        <div
          className="h-full bg-gradient-to-r from-brand-purple to-brand-purple-light transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
