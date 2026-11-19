'use client';

import { useUI } from '@/lib/store';
import { sections } from '@/content/site';

const fallback = [
  'linear-gradient(180deg,#8ec5e8 0%,#d8ecf5 45%,#8cc062 46%,#5e9a42 100%)',
  'linear-gradient(160deg,#f4ebdc,#e3c9a1)',
  'linear-gradient(160deg,#efe4cf,#c9a57a)',
  'linear-gradient(160deg,#f3d9b0,#b07a45)',
  'linear-gradient(160deg,#f6e2cf,#c98a63)',
  'linear-gradient(180deg,#0c1430 0%,#34477a 55%,#1f2c26 56%,#0f1a14 100%)',
];

/**
 * Static alternative to the 3D world (slow devices, Save-Data, or "Simple mode").
 * Shows a pre-rendered still of each room, cross-fading as you scroll.
 */
export function StillBackdrop() {
  const active = useUI((s) => s.active);
  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      {sections.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            opacity: active === i ? 1 : 0,
            backgroundImage: `url(/stills/${s.id}.jpg), ${fallback[i]}`,
          }}
        />
      ))}
    </div>
  );
}
