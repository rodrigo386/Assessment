import type { CompanyInfo } from '@/types/assessment';

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

export async function exportResultsPDF(company: CompanyInfo): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const container = document.getElementById('pdf-content');
  if (!container || container.offsetHeight === 0) {
    throw new Error('Nada para exportar: conteúdo do relatório não encontrado.');
  }

  // Wait for fonts to be loaded
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await (document as Document & { fonts: { ready: Promise<void> } }).fonts.ready;
  }

  document.body.classList.add('pdf-export');
  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#0a0a0a', // dark background — matches the app theme
      useCORS: true,
    });

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const maxContentHeight = pageHeight - margin * 2 - 10; // reserve footer

    // Scale image to fit A4 single page, maintaining aspect ratio
    const canvasAR = canvas.width / canvas.height;
    let imgWidth = contentWidth;
    let imgHeight = imgWidth / canvasAR;

    if (imgHeight > maxContentHeight) {
      imgHeight = maxContentHeight;
      imgWidth = imgHeight * canvasAR;
    }

    // Center horizontally if scaled down
    const xOffset = margin + (contentWidth - imgWidth) / 2;

    const imgData = canvas.toDataURL('image/png');

    // Fill the PDF background with dark color (jsPDF default is white page)
    pdf.setFillColor(10, 10, 10); // #0a0a0a
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.addImage(imgData, 'PNG', xOffset, margin, imgWidth, imgHeight);

    // Footer — light text on dark background
    pdf.setFontSize(7);
    pdf.setTextColor(156, 163, 175); // #9ca3af (brand-muted)
    pdf.text(
      'Relatório gerado por IAgentics | www.iagentics.com.br',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' },
    );

    const filename = `iagentics-assessment-${slugify(company.companyName)}-${company.assessmentDate}.pdf`;
    pdf.save(filename);
  } finally {
    document.body.classList.remove('pdf-export');
  }
}
