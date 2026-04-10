import type { Classification } from '@/types/assessment';

interface ClassificationBadgeProps {
  classification: Classification;
  large?: boolean;
}

export function ClassificationBadge({ classification, large }: ClassificationBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-bold uppercase tracking-wider text-white shadow-lg',
        large ? 'px-5 py-2 text-base' : 'px-3 py-1 text-xs',
      ].join(' ')}
      style={{ backgroundColor: classification.color }}
    >
      {classification.label}
    </span>
  );
}
