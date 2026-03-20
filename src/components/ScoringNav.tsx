'use client';

import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/scoring', label: 'Horse Scoring' },
  { href: '/consigner-scoring', label: 'Consigner Scoring' },
] as const;

export default function ScoringNav() {
  const pathname = usePathname();

  return (
    <div className="scoring-nav">
      <div className="scoring-nav-inner">
        {TABS.map(t => (
          <a
            key={t.href}
            href={t.href}
            className={`scoring-nav-tab${pathname === t.href ? ' scoring-nav-tab-active' : ''}`}
          >
            {t.label}
          </a>
        ))}
      </div>
    </div>
  );
}
