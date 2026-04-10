import type { Classification, FinancialImpact as FinancialImpactData } from '@/types/assessment';

interface FinancialImpactProps {
  classification: Classification;
  impact: FinancialImpactData;
}

export function FinancialImpact({ classification, impact }: FinancialImpactProps) {
  const isBIC = classification.id === 'best-in-class';
  return (
    <div
      data-card
      className="flex flex-col gap-2 rounded-xl border p-5"
      style={{
        borderColor: classification.color,
        backgroundColor: `${classification.color}1A`, // ~10% opacity hex
      }}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-muted">
        <span>{isBIC ? '🏆' : '⚠️'}</span>
        Impacto financeiro estimado
      </div>
      <p className="text-base leading-relaxed text-white sm:text-lg">{impact.message}</p>
      <p className="text-xs text-brand-muted">
        Benchmarks Big4 (Deloitte, PwC, KPMG, EY) para maturidade em procurement.
      </p>
    </div>
  );
}
