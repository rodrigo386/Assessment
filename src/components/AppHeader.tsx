import Image from 'next/image';
import Link from 'next/link';

interface AppHeaderProps {
  right?: React.ReactNode;
}

export function AppHeader({ right }: AppHeaderProps) {
  return (
    <header className="w-full border-b border-brand-border bg-brand-dark/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 focus-visible:outline-none">
          <Image
            src="/logo.webp"
            alt="IAgentics"
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-md object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide text-white">IAgentics</span>
            <span className="text-[10px] uppercase tracking-widest text-brand-muted">
              Procurement Maturity Assessment
            </span>
          </div>
        </Link>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}
