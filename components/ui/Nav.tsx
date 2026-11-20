'use client';

import { useState } from 'react';
import { nav, setUI, useUI, world } from '@/lib/store';
import { ambience } from '@/lib/ambience';
import { zoneAt } from '@/lib/journey';
import { sections, site } from '@/content/site';

/** Nav links: the workshop is split into Skills (jar shelf) and Projects (cards). */
const LINKS = [
  { id: 'about', label: 'About', station: 1 },
  { id: 'skills', label: 'Skills', station: 2 },
  { id: 'projects', label: 'Projects', station: 2 },
  { id: 'research', label: 'Research', station: 3 },
  { id: 'cooking', label: 'Cooking', station: 4 },
  { id: 'contact', label: 'Contact', station: 5 },
];

export function Nav() {
  const active = useUI((s) => s.active);
  const tier = useUI((s) => s.tier);
  const [open, setOpen] = useState(false);
  const night = active === 5;

  const go = (id: string) => {
    setOpen(false);
    nav.scrollTo(id);
  };

  const sound = useUI((s) => s.sound);
  const workshop = useUI((s) => s.workshop);
  const toggleSound = () => {
    if (sound) {
      ambience.stop();
      setUI({ sound: false });
    } else {
      ambience.setZone(zoneAt(world.gSmooth || world.g));
      ambience.start();
      setUI({ sound: true });
    }
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
            <span className="hidden whitespace-nowrap pt-0.5 font-sans [@media(min-width:400px)]:block text-[9px] uppercase tracking-[0.14em] opacity-60 sm:text-[10px] sm:tracking-[0.18em]">A little world</span>
          </span>
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((s) => {
            const isActive = active === s.station && (s.station !== 2 || workshop === s.id);
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
          <button
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? 'Turn off forest sounds' : 'Turn on soft forest sounds'}
            title={sound ? 'Turn off forest sounds' : 'Soft forest sounds'}
            className={`flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium sm:px-3 ${night ? 'hover:bg-white/10' : 'hover:bg-ink/5'} ${sound ? (night ? 'bg-white/15' : 'bg-ink/[0.07]') : ''}`}
          >
            <SoundIcon on={sound} />
            <span className="hidden lg:inline">{sound ? 'Sound on' : 'Sound'}</span>
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
          {LINKS.map((s) => (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              className={`block w-full rounded-2xl px-4 py-3 text-left font-serif text-lg ${
                active === s.station && (s.station !== 2 || workshop === s.id) ? 'bg-ink/5' : ''
              }`}
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

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5Z" />
      {on ? (
        <>
          <path d="M15.5 9.2a4 4 0 0 1 0 5.6">
            <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" repeatCount="indefinite" />
          </path>
          <path d="M18 6.8a7.5 7.5 0 0 1 0 10.4">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
          </path>
        </>
      ) : (
        <path d="m16 10 4 4m0-4-4 4" />
      )}
    </svg>
  );
}
