'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { CurrencyInput } from '@/components/CurrencyInput';
import { useAssessmentStore } from '@/store/assessment-store';

export default function HomePage() {
  const router = useRouter();
  const company = useAssessmentStore((s) => s.company);
  const isComplete = useAssessmentStore((s) => s.isComplete);
  const answers = useAssessmentStore((s) => s.answers);
  const setCompany = useAssessmentStore((s) => s.setCompany);
  const reset = useAssessmentStore((s) => s.reset);

  const today = new Date().toISOString().slice(0, 10);

  const [companyName, setCompanyName] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [assessmentDate, setAssessmentDate] = useState(today);
  const [annualSpend, setAnnualSpend] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const hasInProgress = hydrated && !!company && !isComplete && Object.keys(answers).length > 0;
  const hasCompleted = hydrated && !!company && isComplete;

  const isValid =
    companyName.trim().length >= 2 &&
    evaluatorName.trim().length >= 2 &&
    assessmentDate.length >= 10 &&
    annualSpend > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setCompany({
      companyName: companyName.trim(),
      evaluatorName: evaluatorName.trim(),
      assessmentDate,
      annualSpend,
    });
    router.push('/assessment');
  }

  function handleStartNew() {
    reset();
    setCompanyName('');
    setEvaluatorName('');
    setAssessmentDate(today);
    setAnnualSpend(0);
  }

  const inputClass =
    'w-full rounded-lg border border-brand-border bg-brand-surface px-4 py-3 text-base text-white placeholder:text-brand-muted focus:border-brand-purple focus:outline-none';

  return (
    <div className="relative min-h-screen bg-brand-dark bg-radial-purple">
      <AppHeader />
      <main className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-12 sm:px-6">
        {hasCompleted && (
          <div className="rounded-lg border border-brand-purple/40 bg-brand-purple/10 p-4">
            <p className="text-sm text-white">
              Você tem um relatório completo de <strong>{company?.companyName}</strong>.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push('/results')}
                className="rounded-md bg-brand-purple px-4 py-2 text-sm font-semibold text-white hover:bg-brand-purple-light"
              >
                Ver resultado
              </button>
              <button
                type="button"
                onClick={handleStartNew}
                className="rounded-md border border-brand-border px-4 py-2 text-sm text-brand-text hover:bg-brand-surface"
              >
                Iniciar novo
              </button>
            </div>
          </div>
        )}

        {hasInProgress && !hasCompleted && (
          <button
            type="button"
            onClick={() => router.push('/assessment')}
            className="rounded-lg border border-brand-purple/40 bg-brand-purple/10 p-4 text-left text-sm text-white hover:bg-brand-purple/20"
          >
            ⏵ Retomar assessment em andamento ({company?.companyName})
          </button>
        )}

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Vamos começar</h1>
          <p className="text-brand-muted">
            Em menos de 5 minutos você terá um diagnóstico visual da maturidade de procurement da empresa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="companyName" className="text-sm font-medium text-brand-text">
              Nome da empresa *
            </label>
            <input
              id="companyName"
              type="text"
              required
              minLength={2}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClass}
              placeholder="Ex: Acme Corp"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="evaluatorName" className="text-sm font-medium text-brand-text">
              Nome do consultor *
            </label>
            <input
              id="evaluatorName"
              type="text"
              required
              minLength={2}
              value={evaluatorName}
              onChange={(e) => setEvaluatorName(e.target.value)}
              className={inputClass}
              placeholder="Ex: Maria Silva"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="assessmentDate" className="text-sm font-medium text-brand-text">
              Data
            </label>
            <input
              id="assessmentDate"
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="annualSpend" className="text-sm font-medium text-brand-text">
              Spend anual estimado (R$) *
            </label>
            <CurrencyInput
              id="annualSpend"
              required
              value={annualSpend}
              onChange={setAnnualSpend}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="mt-2 rounded-lg bg-brand-purple px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-purple-light disabled:cursor-not-allowed disabled:bg-brand-border disabled:text-brand-muted"
          >
            Iniciar Assessment →
          </button>
        </form>
      </main>
    </div>
  );
}
