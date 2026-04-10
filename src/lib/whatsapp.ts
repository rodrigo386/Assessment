import type { AssessmentResult, CompanyInfo } from '@/types/assessment';

export function buildWhatsAppText(company: CompanyInfo, result: AssessmentResult): string {
  const p = result.pillarScores;
  return [
    `🔍 Assessment de Maturidade — ${company.companyName}`,
    `📊 Pontuação: ${result.totalScore}/40 (${result.totalPercentage}%)`,
    `📋 Classificação: ${result.classification.label}`,
    ``,
    `Pilares:`,
    `• Dados & Analytics: ${p.dados.percentage}%`,
    `• Pessoas & Governança: ${p.pessoas.percentage}%`,
    `• Processos: ${p.processos.percentage}%`,
    `• Tecnologia: ${p.tecnologia.percentage}%`,
    ``,
    `💡 Gerado por IAgentics | www.iagentics.com.br`,
  ].join('\n');
}

export function buildWhatsAppURL(company: CompanyInfo, result: AssessmentResult): string {
  const text = buildWhatsAppText(company, result);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
