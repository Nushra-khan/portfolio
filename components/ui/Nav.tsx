'use client';

import { useState } from 'react';
import { nav, setUI, useUI } from '@/lib/store';
import { sections, site } from '@/content/site';

export function Nav() {
  const active = useUI((s) => s.active);
  const tier = useUI((s) => s.tier);
  const [open, setOpen] = useState(false);
  const night = active === 5;

  const go = (id: string) => {
    setOpen(false);
    nav.scrollTo(id);
  };

  const toggleLite = () => {
    const next = tier === 'lite' ? 'high' : 'lite';
    try {
      localStorage.setItem('alw-tier', next);
    } catch {}
    setUI({ tier: next, entered: true, notice: null });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <nav
        aria-label="Main"
        className={`mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border px-3 py-2 shadow-soft backdrop-blur-xl transition-colors duration-700 sm:px-5 ${
          night ? 'border-white/10 bg-dusk/60 text-cream' : 'border-white/60 bg-cream/75 text-ink'
        }`}
      >
        <button onClick={() => go('welcome')} className="group flex items-center gap-2 rounded-full px-2 py-1 text-left">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-moss text-cream">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
              <path d="M4 11.5 12 5l8 6.5" />
              <path d="M6 10v9h12v-9" />
              <path d="M10.5 19v-4.5h3V19" />
            </svg>
          </span>
          <span className="hidden font-serif text-[15px] leading-none [@media(min-width:360px)]:block">
            {site.name}
            <span className="block pt-0.5 font-sans text-[10px] uppercase tracking-[0.18em] opacity-60">A little world</span>
          </span>
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {sections.slice(1).map((s, i) => {
            const isActive = active === i + 1;
            return (
              <li key={s.id}>
                <button
                  onClick={() => go(s.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive ? (night ? 'bg-white/15' : 'bg-ink/[0.07]') : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {s.label}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLite}
            title={tier === 'lite' ? 'Switch to the full 3D experience' : 'Switch to simple mode (no 3D)'}
            aria-label={tier === 'lite' ? 'Enable 3D' : 'Simple mode'}
            className={`hidden h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium sm:flex ${night ? 'hover:bg-white/10' : 'hover:bg-ink/5'}`}
          >
            <span className={`h-2 w-2 rounded-full ${tier === 'lite' ? 'bg-honey' : 'bg-moss'}`} />
            {tier === 'lite' ? 'Simple' : '3D'}
          </button>
          <a
            href={site.resumeUrl}
            target="_blank"
            rel="noopener"
            className="flex h-9 items-center gap-1.5 rounded-full bg-terracotta px-4 text-sm font-semibold text-cream shadow-sm transition hover:brightness-110"
          >
            Resume
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" />
            </svg>
          </a>
          <button
            className={`grid h-9 w-9 place-items-center rounded-full md:hidden ${night ? 'hover:bg-white/10' : 'hover:bg-ink/5'}`}
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-white/60 bg-cream/95 p-2 text-ink shadow-soft backdrop-blur-xl md:hidden">
          {sections.slice(1).map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              className={`block w-full rounded-2xl px-4 py-3 text-left font-serif text-lg ${active === i + 1 ? 'bg-ink/5' : ''}`}
            >
              {s.label}
            </button>
          ))}
          <button onClick={toggleLite} className="block w-full rounded-2xl px-4 py-3 text-left text-sm text-ink/70">
            {tier === 'lite' ? 'Switch to 3D experience' : 'Switch to simple mode (lighter, no 3D)'}
          </button>
        </div>
      )}

      {/* journey progress — a little path of stepping stones */}
      <ol className="pointer-events-auto fixed right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex" aria-label="Sections">
        {sections.map((s, i) => (
          <li key={s.id}>
            <button onClick={() => go(s.id)} className="group flex items-center justify-end gap-2" aria-label={s.label}>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium opacity-0 transition group-hover:opacity-100 ${
                  night ? 'bg-dusk/70 text-cream' : 'bg-cream/90 text-ink'
                }`}
              >
                {s.label}
              </span>
              <span
                className={`block rounded-full transition-all duration-500 ${
                  active === i ? 'h-3 w-3 bg-honey ring-4 ring-honey/30' : night ? 'h-2 w-2 bg-cream/50' : 'h-2 w-2 bg-ink/30'
                }`}
              />
            </button>
          </li>
        ))}
      </ol>
    </header>
  );
}
