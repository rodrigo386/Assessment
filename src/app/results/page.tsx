'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppHeader } from '@/components/AppHeader';
import { ClassificationBadge } from '@/components/ClassificationBadge';
import { PillarDetail } from '@/components/PillarDetail';
import { FinancialImpact } from '@/components/FinancialImpact';
import { CommentsSummary } from '@/components/CommentsSummary';
import { ExportPDFButton } from '@/components/ExportPDFButton';
import { WhatsAppShareButton } from '@/components/WhatsAppShareButton';
import { useAssessmentStore } from '@/store/assessment-store';
import { ASSESSMENT_DATA } from '@/data/assessment-data';
import { computeResult } from '@/lib/calculations';
import type { PillarId } from '@/types/assessment';

const RadarChart = dynamic(
  () => import('@/components/RadarChart').then((m) => m.RadarChart),
  { ssr: false, loading: () => <div className="h-[320px] w-full animate-pulse rounded-xl bg-brand-surface" /> },
);

export default function ResultsPage() {
  const router = useRouter();
  const company = useAssessmentStore((s) => s.company);
  const answers = useAssessmentStore((s) => s.answers);
  const isComplete = useAssessmentStore((s) => s.isComplete);
  const reset = useAssessmentStore((s) => s.reset);

  useEffect(() => {
    if (!company || !isComplete) {
      router.replace('/');
    }
  }, [company, isComplete, router]);

  const result = useMemo(() => {
    if (!company || !isComplete) return null;
    return computeResult(company, answers);
  }, [company, answers, isComplete]);

  const pillarIds: PillarId[] = ['dados', 'pessoas', 'processos', 'tecnologia'];

  if (!company || !result) {
    return (
      <div className="min-h-screen bg-brand-dark">
        <AppHeader />
        <main className="mx-auto max-w-xl px-4 py-12 text-brand-muted">Carregando…</main>
      </div>
    );
  }

  const formattedDate = (() => {
    try {
      const [y, m, d] = company.assessmentDate.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return company.assessmentDate;
    }
  })();

  const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: 'easeOut' as const },
  });

  function handleNewAssessment() {
    if (confirm('Iniciar um novo assessment? O resultado atual será perdido.')) {
      reset();
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      <AppHeader
        right={
          <button
            type="button"
            onClick={handleNewAssessment}
            className="no-print rounded-md border border-brand-border px-3 py-1.5 text-xs text-brand-muted hover:bg-brand-surface"
          >
            + Novo Assessment
          </button>
        }
      />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        {/* PDF Page 1 — Summary + Radar */}
        <section
          id="pdf-page-1"
          className="flex flex-col gap-6"
        >
          <motion.div
            data-card
            {...fadeIn(0)}
            className="rounded-xl border border-brand-purple/40 bg-gradient-purple p-6"
          >
            <div className="flex flex-col gap-1 text-xs text-brand-muted sm:flex-row sm:gap-3">
              <span><strong className="text-brand-text">{company.companyName}</strong></span>
              <span>· Consultor: {company.evaluatorName}</span>
              <span>· {formattedDate}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-baseline gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">{result.totalScore}</span>
                <span className="text-xl text-brand-muted">/40</span>
              </div>
              <div className="text-2xl font-semibold text-brand-purple-light">
                {result.totalPercentage}%
              </div>
              <ClassificationBadge classification={result.classification} large />
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              data-card
              {...fadeIn(0.1)}
              className="rounded-xl border border-brand-border bg-brand-surface p-5"
            >
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-muted">
                Visão por pilar
              </h3>
              <RadarChart pillarScores={result.pillarScores} />
            </motion.div>

            <motion.div
              data-card
              {...fadeIn(0.2)}
              className="flex flex-col gap-5 rounded-xl border border-brand-border bg-brand-surface p-5"
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
                Detalhamento por pilar
              </h3>
              {pillarIds.map((id) => {
                const pillar = ASSESSMENT_DATA.find((p) => p.id === id)!;
                return <PillarDetail key={id} pillar={pillar} score={result.pillarScores[id]} />;
              })}
            </motion.div>
          </div>
        </section>

        {/* PDF Page 2 — Financial impact */}
        <section id="pdf-page-2" className="flex flex-col gap-6">
          <motion.div {...fadeIn(0.3)}>
            <FinancialImpact classification={result.classification} impact={result.financialImpact} />
          </motion.div>
        </section>

        {/* PDF Page 3 — Comments (optional) */}
        <section id="pdf-page-3" className="flex flex-col gap-6">
          <motion.div {...fadeIn(0.4)}>
            <CommentsSummary pillars={ASSESSMENT_DATA} answers={answers} />
          </motion.div>
        </section>

        {/* Action buttons — not exported to PDF */}
        <div className="no-print mt-4 flex flex-wrap gap-3">
          <ExportPDFButton company={company} />
          <WhatsAppShareButton company={company} result={result} />
        </div>
      </main>
    </div>
  );
}
