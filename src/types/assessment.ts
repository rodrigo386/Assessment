export type ScoreValue = 0 | 1 | 2 | 3 | 4 | 5;

export type PillarId = 'dados' | 'pessoas' | 'processos' | 'tecnologia';

export type ClassificationId = 'baixa' | 'media' | 'alta' | 'best-in-class';

export interface ScoreOption {
  value: ScoreValue;
  label: string;
  description: string;
}

export interface Question {
  id: string;
  pillarId: PillarId;
  text: string;
  options: ScoreOption[];
}

export interface Pillar {
  id: PillarId;
  number: 1 | 2 | 3 | 4;
  name: string;
  icon: string;
  description: string;
  questions: Question[];
}

export interface CompanyInfo {
  companyName: string;
  evaluatorName: string;
  assessmentDate: string; // ISO yyyy-mm-dd
  annualSpend: number;    // BRL in whole reais
}

export interface Answer {
  questionId: string;
  score: ScoreValue;
  comment: string;
}

export interface Classification {
  id: ClassificationId;
  label: string;
  color: string;
  percentageMin: number;          // inclusive
  percentageMaxExclusive: number; // exclusive (the next bucket starts here, or Infinity for top)
}

export interface PillarScore {
  score: number;
  max: 10;
  percentage: number;
}

export interface FinancialImpact {
  minLossPercent: number | null;
  maxLossPercent: number | null;
  minLossAmount: number | null;
  maxLossAmount: number | null;
  message: string;
}

export interface AssessmentResult {
  totalScore: number;
  totalPercentage: number;
  classification: Classification;
  pillarScores: Record<PillarId, PillarScore>;
  financialImpact: FinancialImpact;
}
