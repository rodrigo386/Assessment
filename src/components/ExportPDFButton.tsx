'use client';

import { useState } from 'react';
import type { AssessmentResult, CompanyInfo } from '@/types/assessment';

interface ExportPDFButtonProps {
  company: CompanyInfo;
  result: AssessmentResult;
}

export function ExportPDFButton({ company, result }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setIsExporting(true);
    setError(null);
    try {
      const { exportResultsPDF } = await import('@/lib/pdf');
      await exportResultsPDF(company, result);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-purple px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-purple-light disabled:cursor-wait disabled:opacity-60"
      >
        <span>📄</span>
        {isExporting ? 'Gerando PDF…' : 'Exportar Relatório PDF'}
      </button>
      {error && <p className="text-xs text-brand-danger">{error}</p>}
    </div>
  );
}
