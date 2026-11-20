import * as THREE from 'three';

/**
 * The whole site is one continuous camera journey.
 * `g` runs from 0 (garden, morning) to ~5.7 (night garden). Each integer is a
 * "station" matching a page section; fractions in between are transitions.
 *
 * Interiors are built underground (y = INTERIOR_Y) so they never peek into the
 * exterior shot; the camera "steps through" the front door and the kitchen's
 * back door under a soft warm light-bloom that hides the cut.
 */

export const INTERIOR_Y = -100;
export const ROOM_X = [0, 16, 32, 48] as const; // study, workshop, library, kitchen
export const ROOM_W = 16;

const Y = INTERIOR_Y;

type Key = { g: number; pos: [number, number, number]; look: [number, number, number]; cut?: boolean };

const keys: Key[] = [
  // Welcome — garden, walking up the path to the door
  { g: 0.0, pos: [-3.2, 2.5, 19.5], look: [-6.8, 3.1, 0] },
  { g: 0.3, pos: [-1.4, 2.1, 14.2], look: [-2.6, 2.4, 0] },
  { g: 0.58, pos: [-0.7, 1.75, 7.6], look: [-1.3, 1.7, 0] },
  { g: 0.8, pos: [-1.3, 1.62, 4.6], look: [-1.3, 1.5, 0] },
  { g: 0.92, pos: [-1.3, 1.58, 3.05], look: [-1.3, 1.5, -2] },
  // About — the study
  { g: 0.925, pos: [0.9, Y + 1.8, 6.2], look: [-0.4, Y + 1.15, -2], cut: true },
  { g: 1.1, pos: [1.0, Y + 1.72, 4.0], look: [-0.35, Y + 1.08, -2] },
  { g: 1.3, pos: [0.7, Y + 1.72, 3.85], look: [-0.6, Y + 1.1, -2] },
  // turn to the recognition wall: calligraphy, gold medals, trophy & role plaques
  { g: 1.5, pos: [-1.35, Y + 1.85, 0.9], look: [-3.0, Y + 2.05, -4.8] },
  { g: 1.68, pos: [-1.55, Y + 1.82, 0.75], look: [-3.1, Y + 2.0, -4.8] },
  { g: 1.86, pos: [6.6, Y + 1.7, 3.2], look: [10.5, Y + 1.5, 2.6] },
  { g: 1.96, pos: [9.6, Y + 1.75, 3.3], look: [14.5, Y + 1.35, 0] },
  // Projects — the workshop
  // sweep along the apothecary shelf of skill jars…
  { g: 2.06, pos: [12.2, Y + 2.85, 0.7], look: [12.4, Y + 2.95, -4.8] },
  { g: 2.25, pos: [16.6, Y + 2.85, 0.7], look: [16.9, Y + 2.95, -4.8] },
  // …then step back to the workbench for the project cards
  { g: 2.36, pos: [15.6, Y + 2.15, 5.0], look: [16.0, Y + 0.95, -2] },
  { g: 2.7, pos: [16.6, Y + 2.05, 4.7], look: [16.4, Y + 0.95, -2] },
  { g: 2.86, pos: [22.6, Y + 1.7, 3.2], look: [26.5, Y + 1.5, 2.6] },
  { g: 2.96, pos: [25.6, Y + 1.75, 3.3], look: [30.5, Y + 1.35, 0] },
  // Research — the library
  { g: 3.1, pos: [30.9, Y + 1.75, 4.1], look: [32.0, Y + 1.25, -2] },
  { g: 3.68, pos: [31.6, Y + 1.7, 3.8], look: [32.5, Y + 1.25, -2] },
  { g: 3.86, pos: [38.6, Y + 1.7, 3.2], look: [42.5, Y + 1.5, 2.6] },
  { g: 3.96, pos: [41.6, Y + 1.75, 3.3], look: [46.5, Y + 1.3, 0] },
  // Cooking — the kitchen
  { g: 4.1, pos: [49.2, Y + 2.0, 4.2], look: [48.2, Y + 0.95, -1] },
  { g: 4.62, pos: [48.6, Y + 1.95, 3.9], look: [47.7, Y + 0.95, -1] },
  { g: 4.78, pos: [50.6, Y + 1.7, 0.6], look: [51.6, Y + 1.5, -6] },
  { g: 4.88, pos: [51.6, Y + 1.62, -3.4], look: [51.6, Y + 1.5, -7] },
  // Contact — back outside, the garden at night
  { g: 4.885, pos: [-6.5, 3.4, 15.5], look: [0.5, 1.6, 3], cut: true },
  { g: 5.12, pos: [9.4, 3.3, 14.2], look: [1.2, 1.3, 4.6] },
  { g: 5.7, pos: [8.8, 3.15, 13.6], look: [1.0, 1.25, 4.6] },
  { g: 6.0, pos: [8.8, 3.15, 13.6], look: [1.0, 1.25, 4.6] },
];

export const CUTS = keys.filter((k) => k.cut).map((k) => k.g - 0.0025);

type Run = { g: number[]; pos: THREE.CatmullRomCurve3; look: THREE.CatmullRomCurve3 };

const runs: Run[] = [];
{
  let current: Key[] = [];
  const flush = () => {
    if (!current.length) return;
    const pts = current.length === 1 ? [current[0], current[0]] : current;
    runs.push({
      g: pts.map((k) => k.g),
      pos: new THREE.CatmullRomCurve3(pts.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal', 0.5),
      look: new THREE.CatmullRomCurve3(pts.map((k) => new THREE.Vector3(...k.look)), false, 'centripetal', 0.5),
    });
  };
  for (const k of keys) {
    if (k.cut) {
      flush();
      current = [];
    }
    current.push(k);
  }
  flush();
}

export function cameraAt(g: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  let run = runs[0];
  for (const r of runs) if (g >= r.g[0]) run = r;
  const gs = run.g;
  const n = gs.length;
  let i = 0;
  while (i < n - 2 && g > gs[i + 1]) i++;
  const span = gs[i + 1] - gs[i] || 1;
  const local = THREE.MathUtils.clamp((g - gs[i]) / span, 0, 1);
  const u = (i + local) / (n - 1);
  run.pos.getPoint(u, outPos);
  run.look.getPoint(u, outLook);
}

/** 0..1 warm light-bloom used to hide the door transitions. */
export function flashAt(g: number) {
  let f = 0;
  for (const c of CUTS) {
    const d = Math.abs(g - c);
    const w = 0.05;
    if (d < w) f = Math.max(f, 1 - THREE.MathUtils.smoothstep(d, w * 0.25, w));
  }
  return f;
}

/** Which environment should be rendered right now. */
export function zoneAt(g: number) {
  const inside = g > CUTS[0] && g < CUTS[1];
  return { inside, night: g >= CUTS[1] };
}

/** Station index nearest to g (used by reduced-motion mode and the nav). */
export function stationOf(g: number) {
  return Math.min(5, Math.max(0, Math.floor(g + 0.15)));
}

/** Reduced-motion camera: hold still at each station rather than flying. */
export const STATION_G = [0.0, 1.1, 2.15, 3.1, 4.1, 5.12];
