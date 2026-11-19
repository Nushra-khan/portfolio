'use client';

import { useSyncExternalStore } from 'react';

/**
 * Hot-path state (scroll position, pointer) lives in a plain mutable object so the
 * 3D render loop can read it every frame without triggering React renders.
 * Slow-changing UI state (active section, hovered item, quality tier) goes through
 * a tiny subscribable store.
 */

export type Tier = 'high' | 'low' | 'lite';

export const world = {
  /** Journey parameter: 0 = garden … 5 = night garden. Fractions are transitions. */
  g: 0,
  /** Same, but eased towards g every frame for buttery camera motion. */
  gSmooth: 0,
  /** Intermediate stage of the two-stage camera smoothing. */
  gMid: 0,
  pointer: { x: 0, y: 0 },
  pointerSmooth: { x: 0, y: 0 },
  reduced: false,
  /** Bell ring impulse (0..1), decays in the render loop. */
  bell: 0,
  /** Debug: freeze g (set via window.__world in ?debug mode). */
  lock: false,
};

type UIState = {
  active: number;
  hovered: string | null;
  tier: Tier;
  entered: boolean;
  focusedRecipe: string | null;
  notice: string | null;
  sound: boolean;
};

let ui: UIState = { active: 0, hovered: null, tier: 'high', entered: false, focusedRecipe: null, notice: null, sound: false };
const listeners = new Set<() => void>();

export function setUI(patch: Partial<UIState>) {
  let changed = false;
  for (const k in patch) {
    const key = k as keyof UIState;
    if (ui[key] !== patch[key]) changed = true;
  }
  if (!changed) return;
  ui = { ...ui, ...patch };
  listeners.forEach((l) => l());
}

export function getUI() {
  return ui;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useUI<T>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(ui),
    () => selector(ui),
  );
}

/** Scroll helper registered by the scroll driver (Lenis when available). */
export const nav = {
  scrollTo: (id: string, opts?: { duration?: number }) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
    void opts;
  },
};

/** Soft two-tone chime, synthesised so there's no audio file to load. */
export function playBell() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const now = ctx.currentTime;
    [
      [1318.5, 0],
      [987.8, 0.22],
    ].forEach(([freq, delay]) => {
      [1, 2.76, 5.4].forEach((harm, i) => {
        const o = ctx.createOscillator();
        const gNode = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq * harm;
        const peak = [0.16, 0.05, 0.02][i];
        gNode.gain.setValueAtTime(0, now + delay);
        gNode.gain.linearRampToValueAtTime(peak, now + delay + 0.01);
        gNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.8 - i * 0.4);
        o.connect(gNode).connect(ctx.destination);
        o.start(now + delay);
        o.stop(now + delay + 2);
      });
    });
    setTimeout(() => ctx.close(), 2600);
  } catch {
    /* audio is a nicety */
  }
  world.bell = 1;
}

/** Switches to the illustrated (no-3D) version and tells the visitor why. */
export function fallBackToStills(reason: string) {
  console.warn('[A Little World] 3D disabled:', reason);
  setUI({ tier: 'lite', entered: true, notice: '3D isn’t available in this browser, so you’re seeing the illustrated version.' });
}

