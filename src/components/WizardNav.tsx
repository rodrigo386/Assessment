interface WizardNavProps {
  canGoBack: boolean;
  canGoForward: boolean;
  isLastQuestion: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function WizardNav({ canGoBack, canGoForward, isLastQuestion, onBack, onNext }: WizardNavProps) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className="rounded-lg border border-brand-border px-5 py-3 text-sm font-medium text-brand-text hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Voltar
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoForward}
        className="rounded-lg bg-brand-purple px-6 py-3 text-sm font-semibold text-white hover:bg-brand-purple-light disabled:cursor-not-allowed disabled:bg-brand-border disabled:text-brand-muted"
      >
        {isLastQuestion ? 'Ver Resultado →' : 'Próxima →'}
      </button>
    </div>
  );
}
