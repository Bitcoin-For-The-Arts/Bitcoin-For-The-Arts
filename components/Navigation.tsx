'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'ABOUT', href: '/about' },
  // { label: 'GRANTS', href: '/grants' },
  // { label: 'ARTISTS', href: '/artists' },  
  // { label: 'PROGRAMMING', href: '/programming' },
  { label: 'CONTACT', href: '/contact' },
  // { label: 'PRIVACY POLICY', href: '/privacy-policy' },
  // { label: 'DONATE', href: '/donate' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col md:flex-row items-center justify-between px-8 py-6 border-b border-gray-200 gap-4">
      <div className="text-2xl font-bold tracking-tight uppercase">
        BITCOIN FOR ART
      </div>
      <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isDonate = item.label === 'DONATE';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-3 py-2 text-xs font-medium transition-colors uppercase tracking-wide whitespace-nowrap
                ${isActive && !isDonate 
                  ? 'bg-black text-white' 
                  : isDonate 
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

