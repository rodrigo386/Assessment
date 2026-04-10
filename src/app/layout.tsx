import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'IAgentics — Assessment de Maturidade em Procurement',
  description:
    'Avaliação de maturidade em procurement com diagnóstico visual, classificação e estimativa de impacto financeiro.',
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-brand-dark text-brand-text antialiased">
        <noscript>
          <div style={{ padding: 20, background: '#7030A0', color: 'white', textAlign: 'center' }}>
            Este aplicativo requer JavaScript ativado para funcionar.
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
