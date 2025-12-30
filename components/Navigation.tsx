'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

type NavItem = {
  label: string;
  href: string;
  variant?: 'default' | 'cta';
};

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Grants', href: '/grants' },
      { label: 'Artists', href: '/artists' },
      { label: 'Programming', href: '/programming' },
      { label: 'Events', href: '/events' },
      { label: 'Stories', href: '/stories' },
      { label: 'Contact', href: '/contact' },
      { label: 'Donate', href: '/donate', variant: 'cta' },
    ],
    [],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold tracking-tight"
          aria-label="Bitcoin for the Arts — Home"
          onClick={() => setIsOpen(false)}
        >
          <span className="text-base sm:text-lg uppercase">Bitcoin for the Arts</span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-black/15 px-3 py-2 text-sm font-medium sm:hidden"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
        >
          Menu
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const isCta = item.variant === 'cta';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium tracking-wide transition-colors uppercase',
                  isCta
                    ? 'bg-orange-400 text-black hover:bg-orange-500'
                    : isActive
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-black/5',
                ].join(' ')}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {isOpen ? (
        <div className="border-t border-black/10 bg-white sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-3">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const isCta = item.variant === 'cta';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={[
                    'rounded-md px-3 py-3 text-sm font-medium tracking-wide transition-colors',
                    isCta
                      ? 'bg-orange-400 text-black hover:bg-orange-500'
                      : isActive
                        ? 'bg-black text-white'
                        : 'text-black hover:bg-black/5',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}

