import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IAgentics Assessment",
  description: "Assessment de Maturidade em Procurement",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
