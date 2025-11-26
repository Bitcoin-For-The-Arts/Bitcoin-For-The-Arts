'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'ABOUT', href: '/about' },
  { label: 'ARTISTS', href: '/artists' },
  { label: 'STORIES', href: '/stories' },
  { label: 'EVENTS', href: '/events' },
  { label: 'CONTACT', href: '/contact' },
  { label: 'SUPPORT', href: '/support' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
      <div className="text-2xl font-bold tracking-tight uppercase">
        BITCOIN FOR ART
      </div>
      <div className="flex items-center gap-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isSupport = item.label === 'SUPPORT';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-3 py-2 text-xs font-medium transition-colors uppercase tracking-wide
                ${isActive && !isSupport 
                  ? 'bg-black text-white' 
                  : isSupport 
                  ? 'bg-lime-400 text-black hover:bg-lime-500' 
                  : 'text-black hover:bg-gray-100'
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

