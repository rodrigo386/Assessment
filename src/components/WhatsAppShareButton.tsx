'use client';

import type { AssessmentResult, CompanyInfo } from '@/types/assessment';
import { buildWhatsAppURL } from '@/lib/whatsapp';

interface WhatsAppShareButtonProps {
  company: CompanyInfo;
  result: AssessmentResult;
}

export function WhatsAppShareButton({ company, result }: WhatsAppShareButtonProps) {
  const url = buildWhatsAppURL(company, result);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#1fb855]"
    >
      <span>📱</span> Compartilhar via WhatsApp
    </a>
  );
}
