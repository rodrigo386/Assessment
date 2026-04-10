import type { Pillar, PillarScore } from '@/types/assessment';

interface PillarDetailProps {
  pillar: Pillar;
  score: PillarScore;
}

function colorFor(percentage: number): string {
  if (percentage < 31) return '#dc2626';
  if (percentage < 51) return '#f59e0b';
  return '#10b981';
}

export function PillarDetail({ pillar, score }: PillarDetailProps) {
  const color = colorFor(score.percentage);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-medium text-white">
          <span className="text-lg">{pillar.icon}</span>
          <span>{pillar.name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</span>
        </div>
        <span className="font-mono text-xs text-brand-muted">
          {score.score}/{score.max} · {score.percentage}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-border">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score.percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
