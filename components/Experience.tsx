'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { world, setUI, nav, useUI, type Tier } from '@/lib/store';
import { stationOf } from '@/lib/journey';
import { sections } from '@/content/site';
import { Nav } from './ui/Nav';
import { Sections } from './ui/Sections';
import { Tooltip } from './ui/Tooltip';
import { StillBackdrop } from './ui/StillBackdrop';

const Scene = dynamic(() => import('./three/Scene'), { ssr: false });

function detectTier(): Tier {
  try {
    const saved = localStorage.getItem('alw-tier');
    if (saved === 'lite' || saved === 'low' || saved === 'high') return saved;
  } catch {}
  const params = new URLSearchParams(location.search);
  const q = params.get('quality');
  if (q === 'lite' || q === 'low' || q === 'high') return q;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return 'lite';
  const nav_ = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav_.connection?.saveData) return 'lite';
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(innerWidth, innerHeight) < 600;
  const weak = (nav_.deviceMemory ?? 8) <= 3 || (navigator.hardwareConcurrency ?? 8) <= 3;
  if (weak && coarse) return 'lite';
  if (coarse || small || weak) return 'low';
  return 'high';
}

/**
 * Maps page scroll to the journey parameter `g`.
 * Each section has a "hold" range while its sticky panel is pinned (g: i → i+0.7)
 * and a transition range while the next section scrolls in (g: i+0.7 → i+1).
 */
function buildMap() {
  const pts: [number, number][] = [];
  const vh = innerHeight;
  sections.forEach((s, i) => {
    const el = document.getElementById(s.id);
    if (!el) return;
    const top = el.offsetTop;
    const end = top + el.offsetHeight - vh;
    pts.push([top, i]);
    pts.push([Math.max(top + 1, end), i + 0.7]);
  });
  return pts;
}

function scrollToG(y: number, pts: [number, number][]) {
  if (!pts.length) return 0;
  if (y <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [y0, g0] = pts[i];
    const [y1, g1] = pts[i + 1];
    if (y <= y1) return g0 + ((y - y0) / Math.max(1, y1 - y0)) * (g1 - g0);
  }
  return pts[pts.length - 1][1];
}

export default function Experience() {
  const tier = useUI((s) => s.tier);
  const [ready, setReady] = useState(false);
  const [capture, setCapture] = useState(false);

  // quality tier + reduced motion
  useEffect(() => {
    setUI({ tier: detectTier() });
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      world.reduced = mq.matches;
      document.documentElement.dataset.reduced = mq.matches ? '1' : '0';
    };
    apply();
    mq.addEventListener('change', apply);
    setCapture(new URLSearchParams(location.search).has('capture'));
    setReady(true);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // smooth scroll + scroll → journey mapping
  useEffect(() => {
    if (!ready) return;
    gsap.registerPlugin(ScrollTrigger);
    let lenis: Lenis | null = null;
    let raf: ((t: number) => void) | null = null;

    if (!world.reduced) {
      lenis = new Lenis({ lerp: 0.065, wheelMultiplier: 0.8, touchMultiplier: 1.2, smoothWheel: true, syncTouch: true, syncTouchLerp: 0.075 });
      lenis.on('scroll', ScrollTrigger.update);
      raf = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    nav.scrollTo = (id, opts) => {
      const el = document.getElementById(id);
      if (!el) return;
      // land just past the start of a section so the camera has arrived at its room
      const y = el.offsetTop + (id === 'welcome' ? 0 : innerHeight * 0.25);
      if (lenis) lenis.scrollTo(y, { duration: opts?.duration ?? 2.4, easing: (t) => 1 - Math.pow(1 - t, 3) });
      else window.scrollTo({ top: y, behavior: world.reduced ? 'auto' : 'smooth' });
    };

    let pts = buildMap();
    const onRefresh = () => {
      pts = buildMap();
    };
    ScrollTrigger.addEventListener('refresh', onRefresh);
    addEventListener('resize', onRefresh);

    if (new URLSearchParams(location.search).has('debug')) (window as unknown as { __world: typeof world }).__world = world;

    const tick = () => {
      const y = lenis ? lenis.scroll : scrollY;
      if (!world.lock) world.g = scrollToG(y, pts);
      setUI({ active: stationOf(world.g) });
    };
    gsap.ticker.add(tick);

    // deep links (#projects etc.)
    if (location.hash) {
      const id = location.hash.slice(1);
      setTimeout(() => nav.scrollTo(id, { duration: 0.01 }), 300);
    }

    const onPointer = (e: PointerEvent) => {
      world.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      world.pointer.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener('pointermove', onPointer, { passive: true });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(tick);
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      removeEventListener('resize', onRefresh);
      removeEventListener('pointermove', onPointer);
    };
  }, [ready]);

  return (
    <>
      {ready && tier !== 'lite' ? <Scene tier={tier} onReady={() => setUI({ entered: true })} /> : null}
      {ready && tier === 'lite' ? <StillBackdrop /> : null}
      {/* warm light-bloom that hides the door transitions */}
      <div id="flash" aria-hidden className="pointer-events-none fixed inset-0 z-[5] bg-[#fff3dc] opacity-0" />
      {!capture && <Nav />}
      <Sections hidden={capture} />
      {!capture && <Tooltip />}
      <Curtain />
    </>
  );
}

function Curtain() {
  const entered = useUI((s) => s.entered);
  const tier = useUI((s) => s.tier);
  const gone = entered || tier === 'lite';
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-cream transition-opacity duration-1000 ${gone ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-[sway_2.4s_ease-in-out_infinite] text-terracotta">
          <BellIcon />
        </div>
        <p className="font-serif text-lg italic text-ink/70">Opening the garden gate…</p>
      </div>
    </div>
  );
}

export function BellIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className || 'h-full w-full'}>
      <path d="M12 3v1.5" />
      <path d="M6.5 16.5c0-1 .8-1.6.8-3.2V11a4.7 4.7 0 0 1 9.4 0v2.3c0 1.6.8 2.2.8 3.2Z" />
      <path d="M5.5 16.5h13" />
      <circle cx="12" cy="19" r="1.4" />
    </svg>
  );
}
