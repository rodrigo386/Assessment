import type {
  Answer,
  AssessmentResult,
  Classification,
  CompanyInfo,
  Currency,
  FinancialImpact,
  PillarId,
  PillarScore,
} from '@/types/assessment';
import { ASSESSMENT_DATA, CLASSIFICATIONS } from '@/data/assessment-data';
import { formatCurrency } from './currency';

function round1(value: number): number {
  return Number(value.toFixed(1));
}

export function calculatePillarScore(
  pillarId: PillarId,
  answers: Record<string, Answer>,
): PillarScore {
  const pillar = ASSESSMENT_DATA.find(p => p.id === pillarId);
  if (!pillar) return { score: 0, max: 10, percentage: 0 };
  const score = pillar.questions.reduce((acc, q) => acc + (answers[q.id]?.score ?? 0), 0);
  return { score, max: 10, percentage: round1((score / 10) * 100) };
}

export function calculateTotalScore(answers: Record<string, Answer>): number {
  return Object.values(answers).reduce((acc, a) => acc + (a?.score ?? 0), 0);
}

export function calculateTotalPercentage(totalScore: number): number {
  return round1((totalScore / 40) * 100);
}

export function getClassification(percentage: number): Classification {
  if (percentage < 31) return CLASSIFICATIONS.baixa;
  if (percentage < 51) return CLASSIFICATIONS.media;
  if (percentage < 60) return CLASSIFICATIONS.alta;
  return CLASSIFICATIONS['best-in-class'];
}

export function calculateFinancialImpact(
  annualSpend: number,
  classification: Classification,
  currency: Currency = 'BRL',
): FinancialImpact {
  const safeSpend = Math.max(0, annualSpend);
  const fmt = (v: number) => formatCurrency(v, currency);

  switch (classification.id) {
    case 'baixa': {
      const minLossAmount = safeSpend * 0.08;
      const maxLossAmount = safeSpend * 0.15;
      return {
        minLossPercent: 8,
        maxLossPercent: 15,
        minLossAmount,
        maxLossAmount,
        message:
          `Sua empresa pode estar perdendo entre ${fmt(minLossAmount)} (8%) e ${fmt(maxLossAmount)} (15%) do spend anual`,
      };
    }
    case 'media': {
      const minLossAmount = safeSpend * 0.03;
      const maxLossAmount = safeSpend * 0.08;
      return {
        minLossPercent: 3,
        maxLossPercent: 8,
        minLossAmount,
        maxLossAmount,
        message:
          `Sua empresa pode estar perdendo entre ${fmt(minLossAmount)} (3%) e ${fmt(maxLossAmount)} (8%) do spend anual`,
      };
    }
    case 'alta': {
      const maxLossAmount = safeSpend * 0.03;
      return {
        minLossPercent: 0,
        maxLossPercent: 3,
        minLossAmount: 0,
        maxLossAmount,
        message: `Sua empresa pode estar perdendo até ${fmt(maxLossAmount)} (3%) do spend anual`,
      };
    }
    case 'best-in-class':
    default:
      return {
        minLossPercent: null,
        maxLossPercent: null,
        minLossAmount: null,
        maxLossAmount: null,
        message: 'Sua operação está no topo — foco em melhoria contínua',
      };
  }
}

export function computeResult(
  company: CompanyInfo,
  answers: Record<string, Answer>,
): AssessmentResult {
  const totalScore = calculateTotalScore(answers);
  const totalPercentage = calculateTotalPercentage(totalScore);
  const classification = getClassification(totalPercentage);
  const pillarIds: PillarId[] = ['dados', 'pessoas', 'processos', 'tecnologia'];
  const pillarScores = pillarIds.reduce(
    (acc, id) => {
      acc[id] = calculatePillarScore(id, answers);
      return acc;
    },
    {} as Record<PillarId, PillarScore>,
  );
  const financialImpact = calculateFinancialImpact(
    company.annualSpend,
    classification,
    company.currency,
  );
  return { totalScore, totalPercentage, classification, pillarScores, financialImpact };
}
