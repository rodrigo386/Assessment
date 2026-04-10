import { describe, it, expect } from 'vitest';
import {
  calculatePillarScore,
  calculateTotalScore,
  calculateTotalPercentage,
  getClassification,
  calculateFinancialImpact,
  computeResult,
} from './calculations';
import { CLASSIFICATIONS } from '@/data/assessment-data';
import type { Answer, CompanyInfo } from '@/types/assessment';

function answer(id: string, score: 0 | 1 | 2 | 3 | 4 | 5, comment = ''): Answer {
  return { questionId: id, score, comment };
}

function answerMap(entries: Answer[]): Record<string, Answer> {
  return Object.fromEntries(entries.map(a => [a.questionId, a]));
}

describe('calculatePillarScore', () => {
  it('returns 0 when no answers', () => {
    expect(calculatePillarScore('dados', {})).toEqual({ score: 0, max: 10, percentage: 0 });
  });

  it('sums 2 answers in the same pillar', () => {
    const answers = answerMap([answer('1.1', 3), answer('1.2', 4)]);
    expect(calculatePillarScore('dados', answers)).toEqual({ score: 7, max: 10, percentage: 70 });
  });

  it('ignores answers from other pillars', () => {
    const answers = answerMap([answer('1.1', 3), answer('2.1', 5)]);
    expect(calculatePillarScore('dados', answers)).toEqual({ score: 3, max: 10, percentage: 30 });
  });

  it('returns 100% when both answers are max', () => {
    const answers = answerMap([answer('4.1', 5), answer('4.2', 5)]);
    expect(calculatePillarScore('tecnologia', answers)).toEqual({ score: 10, max: 10, percentage: 100 });
  });
});

describe('calculateTotalScore', () => {
  it('returns 0 for empty answers', () => {
    expect(calculateTotalScore({})).toBe(0);
  });

  it('sums all 8 answers', () => {
    const answers = answerMap([
      answer('1.1', 3), answer('1.2', 4),
      answer('2.1', 2), answer('2.2', 3),
      answer('3.1', 4), answer('3.2', 5),
      answer('4.1', 2), answer('4.2', 1),
    ]);
    expect(calculateTotalScore(answers)).toBe(24);
  });

  it('returns 40 when all answers are 5', () => {
    const answers = answerMap([
      answer('1.1', 5), answer('1.2', 5),
      answer('2.1', 5), answer('2.2', 5),
      answer('3.1', 5), answer('3.2', 5),
      answer('4.1', 5), answer('4.2', 5),
    ]);
    expect(calculateTotalScore(answers)).toBe(40);
  });
});

describe('calculateTotalPercentage', () => {
  it('0 points → 0%', () => expect(calculateTotalPercentage(0)).toBe(0));
  it('40 points → 100%', () => expect(calculateTotalPercentage(40)).toBe(100));
  it('20 points → 50%', () => expect(calculateTotalPercentage(20)).toBe(50));
  it('24 points → 60%', () => expect(calculateTotalPercentage(24)).toBe(60));
  it('rounds to 1 decimal place', () => {
    expect(calculateTotalPercentage(13)).toBe(32.5);
  });
});

describe('getClassification', () => {
  it('0% → BAIXA', () => expect(getClassification(0).id).toBe('baixa'));
  it('30% → BAIXA', () => expect(getClassification(30).id).toBe('baixa'));
  it('30.99% → BAIXA', () => expect(getClassification(30.99).id).toBe('baixa'));
  it('31% → MÉDIA', () => expect(getClassification(31).id).toBe('media'));
  it('50% → MÉDIA', () => expect(getClassification(50).id).toBe('media'));
  it('50.99% → MÉDIA', () => expect(getClassification(50.99).id).toBe('media'));
  it('51% → ALTA', () => expect(getClassification(51).id).toBe('alta'));
  it('59% → ALTA', () => expect(getClassification(59).id).toBe('alta'));
  it('59.99% → ALTA', () => expect(getClassification(59.99).id).toBe('alta'));
  it('60% → BEST IN CLASS', () => expect(getClassification(60).id).toBe('best-in-class'));
  it('100% → BEST IN CLASS', () => expect(getClassification(100).id).toBe('best-in-class'));
});

describe('calculateFinancialImpact', () => {
  it('BAIXA with 100k spend → 8k..15k', () => {
    const r = calculateFinancialImpact(100_000, CLASSIFICATIONS.baixa);
    expect(r.minLossPercent).toBe(8);
    expect(r.maxLossPercent).toBe(15);
    expect(r.minLossAmount).toBe(8_000);
    expect(r.maxLossAmount).toBe(15_000);
    expect(r.message).toContain('8%');
    expect(r.message).toContain('15%');
  });

  it('MÉDIA with 100k spend → 3k..8k', () => {
    const r = calculateFinancialImpact(100_000, CLASSIFICATIONS.media);
    expect(r.minLossAmount).toBe(3_000);
    expect(r.maxLossAmount).toBe(8_000);
  });

  it('ALTA with 100k spend → up to 3k', () => {
    const r = calculateFinancialImpact(100_000, CLASSIFICATIONS.alta);
    expect(r.minLossPercent).toBe(0);
    expect(r.maxLossPercent).toBe(3);
    expect(r.minLossAmount).toBe(0);
    expect(r.maxLossAmount).toBe(3_000);
    expect(r.message).toContain('até');
  });

  it('BEST IN CLASS → nulls + "topo" message', () => {
    const r = calculateFinancialImpact(100_000, CLASSIFICATIONS['best-in-class']);
    expect(r.minLossPercent).toBeNull();
    expect(r.maxLossPercent).toBeNull();
    expect(r.minLossAmount).toBeNull();
    expect(r.maxLossAmount).toBeNull();
    expect(r.message.toLowerCase()).toContain('topo');
  });

  it('spend = 0 → zero amounts, no crash', () => {
    const r = calculateFinancialImpact(0, CLASSIFICATIONS.baixa);
    expect(r.minLossAmount).toBe(0);
    expect(r.maxLossAmount).toBe(0);
  });
});

describe('computeResult', () => {
  const company: CompanyInfo = {
    companyName: 'Empresa Teste',
    evaluatorName: 'Consultor',
    assessmentDate: '2026-04-09',
    annualSpend: 1_000_000,
  };

  it('computes complete result for happy path', () => {
    const answers = answerMap([
      answer('1.1', 3), answer('1.2', 4),
      answer('2.1', 2), answer('2.2', 3),
      answer('3.1', 4), answer('3.2', 5),
      answer('4.1', 2), answer('4.2', 1),
    ]);
    const r = computeResult(company, answers);
    expect(r.totalScore).toBe(24);
    expect(r.totalPercentage).toBe(60);
    expect(r.classification.id).toBe('best-in-class');
    expect(r.pillarScores.dados).toEqual({ score: 7, max: 10, percentage: 70 });
    expect(r.pillarScores.pessoas).toEqual({ score: 5, max: 10, percentage: 50 });
    expect(r.pillarScores.processos).toEqual({ score: 9, max: 10, percentage: 90 });
    expect(r.pillarScores.tecnologia).toEqual({ score: 3, max: 10, percentage: 30 });
    expect(r.financialImpact.message.toLowerCase()).toContain('topo');
  });

  it('low score → BAIXA + financial impact', () => {
    const answers = answerMap([
      answer('1.1', 1), answer('1.2', 0),
      answer('2.1', 1), answer('2.2', 1),
      answer('3.1', 0), answer('3.2', 1),
      answer('4.1', 1), answer('4.2', 0),
    ]);
    const r = computeResult(company, answers);
    expect(r.totalScore).toBe(5);
    expect(r.totalPercentage).toBe(12.5);
    expect(r.classification.id).toBe('baixa');
    expect(r.financialImpact.minLossAmount).toBe(80_000);
    expect(r.financialImpact.maxLossAmount).toBe(150_000);
  });
});
