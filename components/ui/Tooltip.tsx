'use client';

import { useEffect, useRef } from 'react';
import { useUI } from '@/lib/store';
import { recipes, research, leadership, skillGroups, skillId } from '@/content/site';

function labelFor(id: string | null): string | null {
  if (!id) return null;
  if (id === 'bell') return 'Ring the bell & come in';
  if (id === 'laptop') return 'Peek at my work →';
  if (id === 'robot') return 'Beep boop — that’s Bolt';
  if (id === 'mailbox') return 'Send me a letter';
  if (id === 'bismillah') return 'Bismillah — In the name of God, the Most Gracious, the Most Merciful';
  if (id.startsWith('skill:')) {
    for (const g of skillGroups) {
      const name = g.skills.find((s) => skillId(s) === id);
      if (name) return `${name} · ${g.title}`;
    }
    return null;
  }
  if (id === 'phone') return 'FoundrFuse Android app — built from scratch · open on Google Play';
  if (id === 'exp:foundrfuse') return 'Machine Learning Intern · FoundrFuse';
  if (id === 'exp:iiitk') return 'Research Intern · MINDS Lab, IIIT Kottayam';
  if (id === 'best-website') return 'Workshop Winner — Best Website';
  if (id.startsWith('role:')) {
    const r = leadership.find((x) => `role:${x.id}` === id);
    return r ? `${r.title} · ${r.dates}` : null;
  }
  if (id === 'medals') return 'Two gold medals';
  if (id.startsWith('research:')) {
    const r = research.find((x) => `research:${x.id}` === id);
    return r ? `${r.kind}${r.status ? ` · ${r.status}` : ''}: ${r.title.length > 70 ? r.title.slice(0, 68) + '…' : r.title}` : null;
  }
  if (id.startsWith('recipe:')) {
    const r = recipes.find((x) => `recipe:${x.id}` === id);
    return r ? `${r.title} — tap for the recipe` : null;
  }
  return null;
}

/** Small label that follows the cursor while hovering interactive 3D objects. */
export function Tooltip() {
  const hovered = useUI((s) => s.hovered);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (ref.current) ref.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
    };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, []);
  const label = labelFor(hovered);
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed left-0 top-0 z-[70] hidden rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-cream shadow-soft transition-opacity duration-200 md:block ${
        label ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {label}
    </div>
  );
}
