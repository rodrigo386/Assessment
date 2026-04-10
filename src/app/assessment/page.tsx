'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AppHeader } from '@/components/AppHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionCard } from '@/components/QuestionCard';
import { WizardNav } from '@/components/WizardNav';
import { useAssessmentStore, TOTAL_ASSESSMENT_QUESTIONS } from '@/store/assessment-store';
import { ALL_QUESTIONS, getPillarById } from '@/data/assessment-data';
import type { ScoreValue } from '@/types/assessment';

const SCORE_VALUES: ScoreValue[] = [0, 1, 2, 3, 4, 5];

export default function AssessmentPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const company = useAssessmentStore((s) => s.company);
  const isComplete = useAssessmentStore((s) => s.isComplete);
  const answers = useAssessmentStore((s) => s.answers);
  const currentIndex = useAssessmentStore((s) => s.currentQuestionIndex);
  const setAnswer = useAssessmentStore((s) => s.setAnswer);
  const nextQuestion = useAssessmentStore((s) => s.nextQuestion);
  const previousQuestion = useAssessmentStore((s) => s.previousQuestion);
  const completeAssessment = useAssessmentStore((s) => s.completeAssessment);

  // Route guards — only run after hydration to avoid SSR mismatch on persist
  useEffect(() => {
    if (!company) {
      router.replace('/');
      return;
    }
    if (isComplete) {
      router.replace('/results');
    }
  }, [company, isComplete, router]);

  const currentQuestion = ALL_QUESTIONS[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const pillar = currentQuestion ? getPillarById(currentQuestion.pillarId) : undefined;
  const isLast = currentIndex === TOTAL_ASSESSMENT_QUESTIONS - 1;
  const hasScore = currentAnswer !== undefined;
  const canGoForward = hasScore;

  const handleSelect = useCallback(
    (score: ScoreValue) => {
      if (!currentQuestion) return;
      setAnswer(currentQuestion.id, score, currentAnswer?.comment ?? '');
    },
    [currentQuestion, currentAnswer, setAnswer],
  );

  const handleNext = useCallback(() => {
    if (!canGoForward) return;
    if (isLast) {
      completeAssessment();
      router.push('/results');
    } else {
      nextQuestion();
    }
  }, [canGoForward, isLast, completeAssessment, nextQuestion, router]);

  // Keyboard: ←/→ between options, Enter advances if valid, Esc goes back
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!currentQuestion) return;
      const target = e.target as HTMLElement | null;
      // Don't hijack keys while typing in the comment textarea.
      if (target && target.tagName === 'TEXTAREA') return;

      if (e.key === 'Enter' && canGoForward) {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === 'Escape' && currentIndex > 0) {
        previousQuestion();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const currentScore = currentAnswer?.score;
        const currentPos = currentScore === undefined ? -1 : SCORE_VALUES.indexOf(currentScore);
        const delta = e.key === 'ArrowLeft' ? -1 : 1;
        const nextPos = Math.max(0, Math.min(SCORE_VALUES.length - 1, currentPos + delta));
        const nextScore = SCORE_VALUES[nextPos];
        if (nextScore !== currentScore) {
          handleSelect(nextScore);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentQuestion, currentIndex, currentAnswer, canGoForward, handleNext, handleSelect, previousQuestion]);

  function handleComment(e: React.ChangeEvent<HTMLTextAreaElement>) {
    // Textarea is disabled until a score is selected, so currentAnswer is always defined here.
    if (!currentQuestion || !currentAnswer) return;
    setAnswer(currentQuestion.id, currentAnswer.score, e.target.value);
  }

  const anim = useMemo(
    () =>
      reduceMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } },
    [reduceMotion],
  );

  if (!company || !currentQuestion || !pillar) {
    return (
      <div className="min-h-screen bg-brand-dark">
        <AppHeader />
        <main className="mx-auto max-w-xl px-4 py-12 text-brand-muted">Carregando…</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      <AppHeader />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
        <ProgressBar current={currentIndex + 1} total={TOTAL_ASSESSMENT_QUESTIONS} />

        <AnimatePresence mode="wait">
          <motion.section
            key={currentQuestion.id}
            initial={anim.initial}
            animate={anim.animate}
            exit={anim.exit}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple-light">
                <span className="text-lg">{pillar.icon}</span>
                <span>{pillar.name}</span>
              </div>
              <p className="text-xs text-brand-muted">{pillar.description}</p>
            </div>

            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              {currentQuestion.text}
            </h2>

            <div className="flex flex-col gap-2">
              {currentQuestion.options.map((opt) => (
                <QuestionCard
                  key={opt.value}
                  option={opt}
                  selected={currentAnswer?.score === opt.value}
                  onSelect={() => handleSelect(opt.value)}
                />
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="comment" className="text-sm font-medium text-brand-muted">
                💬 Comentário (opcional)
              </label>
              <textarea
                id="comment"
                rows={3}
                maxLength={500}
                value={currentAnswer?.comment ?? ''}
                onChange={handleComment}
                disabled={!hasScore}
                placeholder={
                  hasScore
                    ? 'Notas do consultor sobre essa resposta…'
                    : 'Selecione uma pontuação acima para habilitar o comentário'
                }
                className="w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm text-white placeholder:text-brand-muted focus:border-brand-purple focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <WizardNav
              canGoBack={currentIndex > 0}
              canGoForward={canGoForward}
              isLastQuestion={isLast}
              onBack={previousQuestion}
              onNext={handleNext}
            />
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}
