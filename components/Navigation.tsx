'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import logoImage from '../app/asset/BITCOIN-ARTS-LOGO-Gold.png';

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
      { label: 'Why Bitcoin', href: '/artists/why-bitcoin' },
      { label: 'Programming', href: '/programming' },
      { label: 'Events', href: '/events' },
      { label: 'Stories', href: '/stories' },
      { label: 'Contact', href: '/contact' },
      { label: 'Donate', href: '/donate', variant: 'cta' },
    ],
    [],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-primary text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold tracking-tight"
          aria-label="Bitcoin for the Arts — Home"
          onClick={() => setIsOpen(false)}
        >
          <Image
            src={logoImage}
            alt=""
            width={48}
            height={48}
            priority
            className="h-9 w-9 sm:h-11 sm:w-11 rounded-full border border-white/20"
          />
          <span className="text-base sm:text-lg uppercase">
            Bitcoin for the Arts
          </span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-white/25 px-3 py-2 text-sm font-medium sm:hidden hover:bg-white/10"
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
                    ? 'bg-accent text-white hover:opacity-90'
                    : isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/90 hover:bg-white/10 hover:text-white',
                ].join(' ')}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {isOpen ? (
        <div className="border-t border-white/15 bg-primary sm:hidden">
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
                      ? 'bg-accent text-white hover:opacity-90'
                      : isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/90 hover:bg-white/10 hover:text-white',
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

