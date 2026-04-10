import type { AssessmentResult, CompanyInfo } from '@/types/assessment';

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

export async function exportResultsPDF(
  company: CompanyInfo,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _result: AssessmentResult,
): Promise<void> {
  // Lazy import so the PDF libs don't bloat the initial bundle.
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const pageIds = ['pdf-page-1', 'pdf-page-2', 'pdf-page-3'] as const;
  const elements = pageIds
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => {
      if (!el) return false;
      // Skip a page that's entirely empty (e.g., pdf-page-3 without comments)
      return el.textContent?.trim() !== '' && el.offsetHeight > 0;
    });

  if (elements.length === 0) {
    throw new Error('Nada para exportar: seções do relatório não encontradas.');
  }

  // Ensure fonts are fully loaded before capture
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await (document as Document & { fonts: { ready: Promise<void> } }).fonts.ready;
  }

  document.body.classList.add('pdf-export');
  try {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const maxContentHeight = pageHeight - margin * 2 - 12; // reserve footer

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const scaledHeight = Math.min((canvas.height * contentWidth) / canvas.width, maxContentHeight);

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin + 5, contentWidth, scaledHeight);

      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text(
        'Relatório gerado por IAgentics | www.iagentics.com.br',
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' },
      );
      pdf.text(`Página ${i + 1}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    const filename = `iagentics-assessment-${slugify(company.companyName)}-${company.assessmentDate}.pdf`;
    pdf.save(filename);
  } finally {
    document.body.classList.remove('pdf-export');
  }
}
