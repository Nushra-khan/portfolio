'use client';

import * as THREE from 'three';
import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { paint, textures, screenTexture, windowSky, seeded, windify } from './materials';
import { Instanced, geo, type Inst } from './Nature';
import { Steam, FloatingMotes } from './Particles';
import { Ramen, Cake, Sandwich, RoastChicken, WhiteSaucePasta, FruitBowl } from './Food';
import { INTERIOR_Y, ROOM_X } from '@/lib/journey';
import { setUI, nav, useUI } from '@/lib/store';
import { research, recipes } from '@/content/site';
import { Calligraphy, PrayerMat, QuranStand, zelligeTexture } from './Heritage';
import { RecognitionShelf } from './Recognition';
import { SkillJars } from './SkillJars';

const H = 4.4; // ceiling
const D = 5; // half depth
const HW = 8; // half width
const DOOR_Z = [1.75, 4.35];
const DOOR_H = 3.0;

/* ----------------------------------------------------------- utilities -- */

function useHoverable(id: string, onClick?: () => void) {
  // shared with the DOM: hovering a card in the panel highlights its 3D object too
  const hover = useUI((s) => s.hovered === id);
  const setHover = (_: boolean) => {};
  return {
    hover,
    bind: {
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(true);
        setUI({ hovered: id });
        document.body.style.cursor = 'pointer';
      },
      onPointerOut: () => {
        setHover(false);
        setUI({ hovered: null });
        document.body.style.cursor = '';
      },
      onClick: (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick?.();
      },
    },
  };
}

/** Smoothly lerps a group's local transform toward a hover target. */
function Lift({ active, children, y = 0.08, rot = 0.4, position }: { active: boolean; children: ReactNode; y?: number; rot?: number; position?: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 7);
    g.position.y = THREE.MathUtils.lerp(g.position.y, active ? y : 0, k);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, active ? rot : 0, k);
  });
  return (
    <group position={position}>
      <group ref={ref}>{children}</group>
    </group>
  );
}

/* ---------------------------------------------------------------- shell -- */

function Room({
  cx,
  wall,
  sky,
  leftDoor,
  rightWall,
  backDoorX,
  windowX = [-2],
  windowSize = [1.8, 1.6],
}: {
  cx: number;
  wall: string;
  sky: THREE.Texture;
  leftDoor: boolean;
  rightWall: boolean;
  backDoorX?: number;
  windowX?: number[];
  windowSize?: [number, number];
}) {
  const t = textures();
  const wallMat = paint(wall, { map: t.plaster });
  const wood = paint('#8a5a34');
  const floor = paint('#ffffff', { map: t.planks, roughness: 0.7 });
  const skyMat = useMemo(() => new THREE.MeshBasicMaterial({ map: sky, toneMapped: false }), [sky]);

  const sideWall = (x: number, door: boolean) =>
    door ? (
      <group position={[x, 0, 0]}>
        <mesh position={[0, H / 2, (-D + DOOR_Z[0]) / 2]} geometry={geo.box} scale={[0.3, H, DOOR_Z[0] + D]} material={wallMat} receiveShadow />
        <mesh position={[0, (H + DOOR_H) / 2, (DOOR_Z[0] + DOOR_Z[1]) / 2]} geometry={geo.box} scale={[0.3, H - DOOR_H, DOOR_Z[1] - DOOR_Z[0]]} material={wallMat} />
        <mesh position={[0, H / 2, (DOOR_Z[1] + D) / 2]} geometry={geo.box} scale={[0.3, H, D - DOOR_Z[1]]} material={wallMat} />
        {/* door casing */}
        <mesh position={[0, DOOR_H + 0.08, (DOOR_Z[0] + DOOR_Z[1]) / 2]} geometry={geo.box} scale={[0.4, 0.16, DOOR_Z[1] - DOOR_Z[0] + 0.3]} material={wood} />
        {DOOR_Z.map((z) => (
          <mesh key={z} position={[0, DOOR_H / 2, z]} geometry={geo.box} scale={[0.4, DOOR_H, 0.14]} material={wood} />
        ))}
      </group>
    ) : (
      <mesh position={[x, H / 2, 0]} geometry={geo.box} scale={[0.3, H, D * 2]} material={wallMat} receiveShadow />
    );

  return (
    <group position={[cx, 0, 0]}>
      {/* floor + ceiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={floor} receiveShadow>
        <planeGeometry args={[HW * 2, D * 2]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]} material={paint('#efe4d0')}>
        <planeGeometry args={[HW * 2, D * 2]} />
      </mesh>
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={x} position={[x, H - 0.12, 0]} geometry={geo.box} scale={[0.22, 0.24, D * 2]} material={wood} castShadow />
      ))}
      {/* back wall with window hole(s) */}
      <BackWall wallMat={wallMat} windows={windowX.map((x) => ({ x, w: windowSize[0], h: windowSize[1] }))} door={backDoorX} />
      {windowX.map((x) => (
        <group key={x} position={[x, 2.3, -D]}>
          <mesh position={[0, 0, -0.25]} material={skyMat}>
            <planeGeometry args={[windowSize[0] + 0.6, windowSize[1] + 0.6]} />
          </mesh>
          <mesh position={[0, 0, 0.17]} geometry={geo.box} scale={[0.06, windowSize[1], 0.06]} material={wood} />
          <mesh position={[0, 0.15, 0.17]} geometry={geo.box} scale={[windowSize[0], 0.06, 0.06]} material={wood} />
          <mesh position={[0, -windowSize[1] / 2 - 0.05, 0.25]} geometry={geo.box} scale={[windowSize[0] + 0.3, 0.08, 0.3]} material={wood} castShadow />
          <mesh position={[0, windowSize[1] / 2 + 0.05, 0.18]} geometry={geo.box} scale={[windowSize[0] + 0.2, 0.1, 0.1]} material={wood} />
          {[-1, 1].map((s) => (
            <mesh key={s} position={[(s * windowSize[0]) / 2, 0, 0.18]} geometry={geo.box} scale={[0.1, windowSize[1] + 0.1, 0.1]} material={wood} />
          ))}
          {/* curtains */}
          {[-1, 1].map((s) => (
            <mesh key={`c${s}`} position={[s * (windowSize[0] / 2 + 0.15), 0.05, 0.22]} geometry={geo.box} scale={[0.35, windowSize[1] + 0.4, 0.04]} material={paint('#f6e6d3')} />
          ))}
        </group>
      ))}
      {/* wainscot */}
      <mesh position={[0, 0.5, -D + 0.17]} geometry={geo.box} scale={[HW * 2, 1.0, 0.04]} material={paint('#c9a57a', { map: t.planks })} />
      <mesh position={[0, 1.02, -D + 0.2]} geometry={geo.box} scale={[HW * 2, 0.06, 0.08]} material={wood} />
      {sideWall(-HW, leftDoor)}
      {rightWall && sideWall(HW, false)}
    </group>
  );
}

function BackWall({ wallMat, windows, door }: { wallMat: THREE.Material; windows: { x: number; w: number; h: number }[]; door?: number }) {
  const geom = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-HW, 0);
    s.lineTo(HW, 0);
    s.lineTo(HW, H);
    s.lineTo(-HW, H);
    s.closePath();
    windows.forEach(({ x, w, h }) => {
      const p = new THREE.Path();
      p.moveTo(x - w / 2, 2.3 - h / 2);
      p.lineTo(x - w / 2, 2.3 + h / 2);
      p.lineTo(x + w / 2, 2.3 + h / 2);
      p.lineTo(x + w / 2, 2.3 - h / 2);
      p.closePath();
      s.holes.push(p);
    });
    if (door !== undefined) {
      const p = new THREE.Path();
      p.moveTo(door - 0.6, 0.01);
      p.lineTo(door - 0.6, 2.4);
      p.lineTo(door + 0.6, 2.4);
      p.lineTo(door + 0.6, 0.01);
      p.closePath();
      s.holes.push(p);
    }
    return new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false });
  }, [windows, door]);
  return <mesh geometry={geom} material={wallMat} position={[0, 0, -D - 0.15]} receiveShadow />;
}

/* -------------------------------------------------------------- props -- */

const nightDoorMat = new THREE.MeshBasicMaterial({ toneMapped: false });
let nightDoorReady = false;
function ensureNightDoor() {
  if (nightDoorReady || typeof document === 'undefined') return;
  nightDoorReady = true;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#0c1430');
  g.addColorStop(1, '#34477a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255,245,220,${0.4 + Math.random() * 0.6})`;
    ctx.fillRect(Math.random() * 128, Math.random() * 150, 1.5, 1.5);
  }
  ctx.fillStyle = '#f6f1df';
  ctx.beginPath();
  ctx.arc(86, 60, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d2a1d';
  ctx.beginPath();
  ctx.moveTo(0, 256);
  ctx.quadraticCurveTo(50, 190, 128, 205);
  ctx.lineTo(128, 256);
  ctx.fill();
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = '#ffd27a';
    ctx.beginPath();
    ctx.arc(10 + Math.random() * 108, 200 + Math.random() * 50, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  nightDoorMat.map = tex;
  nightDoorMat.needsUpdate = true;
}

const bookMat = new THREE.MeshStandardMaterial({ roughness: 0.8 });
const plantMat = windify(new THREE.MeshStandardMaterial({ roughness: 0.8, color: '#5e9a42' }), 0.01, 1, 1);

function Books({ shelves, seed = 1 }: { shelves: { x0: number; x1: number; y: number; z: number; rot?: number }[]; seed?: number }) {
  const items = useMemo<Inst[]>(() => {
    const r = seeded(seed);
    const cols = ['#8c3b3b', '#3b5b8c', '#4f6b3a', '#c2683f', '#e7b45a', '#6b4a7a', '#2f4f4f', '#d9c9a8', '#a8553a', '#5a7fa8'];
    const out: Inst[] = [];
    shelves.forEach((s) => {
      let x = s.x0;
      while (x < s.x1) {
        const w = 0.05 + r() * 0.06;
        if (r() < 0.06) {
          x += w * 3;
          continue;
        }
        const h = 0.24 + r() * 0.14;
        const lean = r() < 0.08 ? 0.2 : 0;
        out.push({ p: [x + w / 2, s.y + h / 2, s.z], s: [w, h, 0.22], r: [0, s.rot ?? 0, lean], c: cols[Math.floor(r() * cols.length)] });
        x += w + 0.008;
      }
    });
    return out;
  }, [shelves, seed]);
  return <Instanced items={items} geometry={geo.box} material={bookMat} castShadow />;
}

function Bookshelf({ position, w = 2, h = 3, rows = 5, seed = 1, rot = 0 }: { position: [number, number, number]; w?: number; h?: number; rows?: number; seed?: number; rot?: number }) {
  const wood = paint('#7a4f2e');
  const shelves = useMemo(() => Array.from({ length: rows }, (_, i) => ({ x0: -w / 2 + 0.06, x1: w / 2 - 0.06, y: 0.1 + (i * (h - 0.2)) / rows + 0.03, z: 0 })), [w, h, rows]);
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <mesh position={[0, h / 2, -0.17]} geometry={geo.box} scale={[w, h, 0.04]} material={paint('#5e3d24')} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * w) / 2, h / 2, 0]} geometry={geo.box} scale={[0.06, h, 0.36]} material={wood} castShadow />
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <mesh key={i} position={[0, 0.1 + (i * (h - 0.2)) / rows, 0]} geometry={geo.box} scale={[w, 0.05, 0.36]} material={wood} castShadow receiveShadow />
      ))}
      <Books shelves={shelves} seed={seed} />
    </group>
  );
}

function Plant({ position, s = 1 }: { position: [number, number, number]; s?: number }) {
  const leaves = useMemo<Inst[]>(() => {
    const r = seeded(Math.floor(position[0] * 7 + position[2] * 13 + 3));
    return Array.from({ length: 9 }, () => ({
      p: [(r() - 0.5) * 0.3, 0.35 + r() * 0.3, (r() - 0.5) * 0.3] as [number, number, number],
      s: [0.12, 0.06, 0.2] as [number, number, number],
      r: [r() - 0.5, r() * 6, r() - 0.5] as [number, number, number],
    }));
  }, [position]);
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 0.15, 0]} material={paint('#c0703f')} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.3, 14]} />
      </mesh>
      <Instanced items={leaves} geometry={geo.sphere} material={plantMat} castShadow />
    </group>
  );
}

function Chair({ position, rot = 0, color = '#7b9a6a' }: { position: [number, number, number]; rot?: number; color?: string }) {
  const fab = paint(color, { roughness: 1 });
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.35, 0]} geometry={geo.box} scale={[0.95, 0.36, 0.85]} material={fab} castShadow receiveShadow />
      <mesh position={[0, 0.85, -0.36]} geometry={geo.box} scale={[0.95, 0.8, 0.2]} material={fab} castShadow />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.48, 0.6, 0]} geometry={geo.box} scale={[0.18, 0.4, 0.85]} material={fab} castShadow />
      ))}
      <mesh position={[0, 0.58, 0.05]} geometry={geo.box} scale={[0.7, 0.12, 0.65]} material={paint('#f1e3c8')} />
      <mesh position={[0.15, 0.75, -0.1]} rotation={[0.3, 0.3, 0.2]} geometry={geo.box} scale={[0.4, 0.35, 0.12]} material={paint('#e7b45a')} />
    </group>
  );
}

function Lamp({ position, h = 1.6 }: { position: [number, number, number]; h?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} geometry={geo.cyl} scale={[0.025, h, 0.025]} material={paint('#3d3a35')} />
      <mesh position={[0, 0.02, 0]} geometry={geo.cyl} scale={[0.18, 0.04, 0.18]} material={paint('#3d3a35')} />
      <mesh position={[0, h + 0.1, 0]} material={paint('#fbe7c0', { emissive: '#ffcf8a', emissiveIntensity: 1.2, side: THREE.DoubleSide })}>
        <cylinderGeometry args={[0.16, 0.26, 0.3, 18, 1, true]} />
      </mesh>
    </group>
  );
}

function Frame({ position, w, h, color, rot = 0 }: { position: [number, number, number]; w: number; h: number; color: string; rot?: number }) {
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <mesh geometry={geo.box} scale={[w + 0.08, h + 0.08, 0.04]} material={paint('#7a4f2e')} />
      <mesh position={[0, 0, 0.025]} material={paint(color)}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
}

function Rug({ position, w, d }: { position: [number, number, number]; w: number; d: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} material={paint('#ffffff', { map: textures().rug, roughness: 1 })} receiveShadow>
      <planeGeometry args={[w, d]} />
    </mesh>
  );
}

function HangingBulb({ position, len = 1 }: { position: [number, number, number]; len?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, -len / 2, 0]} geometry={geo.cyl} scale={[0.008, len, 0.008]} material={paint('#2b2a26')} />
      <mesh position={[0, -len - 0.06, 0]} material={paint('#fff1c9', { emissive: '#ffbf5e', emissiveIntensity: 2.2 })}>
        <sphereGeometry args={[0.07, 12, 10]} />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------------------- study -- */

function BismillahPanel() {
  const { bind } = useHoverable('bismillah');
  return <Calligraphy position={[-3.65, 3.17, -4.84]} width={1.22} bind={bind} />;
}

/** Shadow-box frame holding two gold medals. */
function MedalFrame({ position }: { position: [number, number, number] }) {
  const { hover, bind } = useHoverable('medals');
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e8b74a', metalness: 0.85, roughness: 0.28, emissive: '#7a5410', emissiveIntensity: 0.15 }), []);
  const medals = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const k = 1 - Math.exp(-dt * 5);
    gold.emissiveIntensity = THREE.MathUtils.lerp(gold.emissiveIntensity, hover ? 0.6 : 0.15, k);
    if (medals.current) {
      const t = state.clock.elapsedTime;
      medals.current.children.forEach((m, i) => {
        m.rotation.z = THREE.MathUtils.lerp(m.rotation.z, hover ? Math.sin(t * 3 + i) * 0.06 : 0, k);
      });
    }
  });
  const wood = paint('#5e3d24');
  const W = 1.05;
  const Hh = 0.8;
  return (
    <group position={position} {...bind}>
      {/* frame */}
      {[
        [0, Hh / 2, W + 0.12, 0.08],
        [0, -Hh / 2, W + 0.12, 0.08],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.05]} geometry={geo.box} scale={[w, h, 0.12]} material={wood} castShadow />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * W) / 2, 0, 0.05]} geometry={geo.box} scale={[0.08, Hh + 0.08, 0.12]} material={wood} castShadow />
      ))}
      <mesh position={[0, 0, 0]} geometry={geo.box} scale={[W, Hh, 0.02]} material={paint('#1f2b4d', { roughness: 1 })} />
      {/* medals with ribbons */}
      <group ref={medals}>
        {[-0.24, 0.24].map((x, i) => (
          <group key={x} position={[x, 0.3, 0.03]}>
            <mesh position={[-0.045, -0.12, 0]} rotation={[0, 0, 0.32]} geometry={geo.box} scale={[0.07, 0.26, 0.008]} material={paint(i ? '#3b5b8c' : '#c2393b')} />
            <mesh position={[0.045, -0.12, 0.002]} rotation={[0, 0, -0.32]} geometry={geo.box} scale={[0.07, 0.26, 0.008]} material={paint(i ? '#c2393b' : '#3b5b8c')} />
            <group position={[0, -0.33, 0.015]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} material={gold} castShadow>
                <cylinderGeometry args={[0.105, 0.105, 0.02, 32]} />
              </mesh>
              <mesh position={[0, 0, 0.011]} material={gold}>
                <torusGeometry args={[0.085, 0.008, 6, 32]} />
              </mesh>
              {/* star emboss */}
              <mesh position={[0, 0, 0.012]} material={gold}>
                <circleGeometry args={[0.045, 5]} />
              </mesh>
              <mesh position={[0, 0, 0.013]} rotation={[0, 0, Math.PI / 5]} material={gold}>
                <circleGeometry args={[0.045, 5]} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
      {/* brass plaque */}
      <mesh position={[0, -0.31, 0.02]} geometry={geo.box} scale={[0.36, 0.07, 0.01]} material={paint('#d9a441', { metalness: 0.7, roughness: 0.35 })} />
      {/* glass */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[W, Hh]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.08} roughness={0.05} metalness={0.2} />
      </mesh>
    </group>
  );
}


function Laptop({ position }: { position: [number, number, number] }) {
  const lid = useRef<THREE.Group>(null);
  const screenMat = useMemo(() => new THREE.MeshStandardMaterial({ map: screenTexture('code'), emissive: '#ffffff', emissiveMap: screenTexture('code'), emissiveIntensity: 0.8 }), []);
  const { hover, bind } = useHoverable('laptop', () => nav.scrollTo('projects', { duration: 3 }));
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 6);
    if (lid.current) lid.current.rotation.x = THREE.MathUtils.lerp(lid.current.rotation.x, hover ? 1.12 : 1.35, k);
    screenMat.emissiveIntensity = THREE.MathUtils.lerp(screenMat.emissiveIntensity, hover ? 1.4 : 0.8, k);
  });
  const body = paint('#c9ccd1', { metalness: 0.5, roughness: 0.35 });
  return (
    <group position={position} rotation={[0, 0.25, 0]} {...bind}>
      <mesh position={[0, 0.012, 0]} geometry={geo.box} scale={[0.62, 0.024, 0.42]} material={body} castShadow />
      <mesh position={[0, 0.026, 0.04]} geometry={geo.box} scale={[0.52, 0.004, 0.2]} material={paint('#2b2a26')} />
      <group ref={lid} position={[0, 0.024, -0.21]} rotation={[1.35, 0, 0]}>
        <mesh position={[0, 0, -0.2]} rotation={[0, 0, 0]} geometry={geo.box} scale={[0.62, 0.018, 0.42]} material={body} castShadow />
        <mesh position={[0, 0.011, -0.2]} rotation={[-Math.PI / 2, 0, 0]} material={screenMat}>
          <planeGeometry args={[0.56, 0.36]} />
        </mesh>
      </group>
      <mesh visible={false} position={[0, 0.2, -0.1]}>
        <boxGeometry args={[0.8, 0.5, 0.6]} />
      </mesh>
    </group>
  );
}

function Study() {
  const cx = ROOM_X[0];
  return (
    <group position={[cx, 0, 0]}>
      {/* desk */}
      <group position={[-1.6, 0, -3.9]}>
        <mesh position={[0, 0.78, 0]} geometry={geo.box} scale={[2.3, 0.07, 0.95]} material={paint('#9b6239', { map: textures().planks })} castShadow receiveShadow />
        {[
          [-1.05, -0.4],
          [1.05, -0.4],
          [-1.05, 0.4],
          [1.05, 0.4],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.38, z]} geometry={geo.box} scale={[0.08, 0.76, 0.08]} material={paint('#7a4f2e')} castShadow />
        ))}
        <mesh position={[0.75, 0.55, 0]} geometry={geo.box} scale={[0.6, 0.4, 0.85]} material={paint('#8a5a34')} castShadow />
        <Laptop position={[-0.15, 0.815, 0.1]} />
        {/* stack of books */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0.78, 0.84 + i * 0.055, -0.15]} rotation={[0, i * 0.2, 0]} geometry={geo.box} scale={[0.36, 0.05, 0.26]} material={paint(['#8c3b3b', '#3b5b8c', '#e7b45a', '#4f6b3a'][i])} castShadow />
        ))}
        {/* mug + steam */}
        <group position={[0.45, 0.815, 0.25]}>
          <mesh position={[0, 0.06, 0]} material={paint('#c2683f', { roughness: 0.4 })} castShadow>
            <cylinderGeometry args={[0.05, 0.045, 0.12, 16]} />
          </mesh>
          <mesh position={[0.055, 0.06, 0]} rotation={[0, 0, Math.PI / 2]} material={paint('#c2683f')}>
            <torusGeometry args={[0.03, 0.01, 6, 12, Math.PI]} />
          </mesh>
          <Steam position={[0, 0.12, 0]} count={8} height={0.4} spread={0.03} size={34} opacity={0.28} />
        </group>
        {/* desk lamp */}
        <group position={[-0.85, 0.815, -0.2]}>
          <mesh position={[0, 0.02, 0]} geometry={geo.cyl} scale={[0.1, 0.03, 0.1]} material={paint('#3b5b8c')} />
          <mesh position={[0.05, 0.25, 0]} rotation={[0, 0, -0.3]} geometry={geo.cyl} scale={[0.015, 0.5, 0.015]} material={paint('#3b5b8c')} />
          <mesh position={[0.2, 0.47, 0.05]} rotation={[0.6, 0, -0.9]} material={paint('#3b5b8c', { side: THREE.DoubleSide })}>
            <coneGeometry args={[0.1, 0.16, 16, 1, true]} />
          </mesh>
          <mesh position={[0.24, 0.43, 0.08]} material={paint('#fff1c9', { emissive: '#ffcf8a', emissiveIntensity: 2.5 })}>
            <sphereGeometry args={[0.035, 10, 8]} />
          </mesh>
        </group>
        <Plant position={[-1.0, 0.815, 0.25]} s={0.7} />
        {/* notebook + pencil */}
        <mesh position={[0.25, 0.82, 0.3]} rotation={[0, -0.3, 0]} geometry={geo.box} scale={[0.25, 0.012, 0.32]} material={paint('#f3e9d4')} />
        <mesh position={[0.28, 0.83, 0.3]} rotation={[0, 0.7, Math.PI / 2]} geometry={geo.cyl} scale={[0.008, 0.2, 0.008]} material={paint('#e7b45a')} />
        {/* chair */}
        <group position={[-0.1, 0, 0.75]} rotation={[0, 0.2, 0]}>
          <mesh position={[0, 0.48, 0]} geometry={geo.box} scale={[0.5, 0.06, 0.5]} material={paint('#9b6239')} castShadow />
          <mesh position={[0, 0.82, 0.24]} geometry={geo.box} scale={[0.5, 0.6, 0.05]} material={paint('#9b6239')} castShadow />
          {[
            [-0.22, -0.22],
            [0.22, -0.22],
            [-0.22, 0.22],
            [0.22, 0.22],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.24, z]} geometry={geo.box} scale={[0.05, 0.48, 0.05]} material={paint('#7a4f2e')} />
          ))}
        </group>
      </group>
      <BismillahPanel />
      <PrayerMat position={[-3.0, 0, -2.0]} rotation={0.35} />
      {/* corkboard with pinned notes */}
      <group position={[0.5, 2.3, -4.82]}>
        <mesh geometry={geo.box} scale={[1.2, 0.9, 0.04]} material={paint('#c49a6c')} />
        {[
          [-0.35, 0.2, '#f2d16b'],
          [0.1, 0.25, '#f4a6c1'],
          [0.38, -0.05, '#a9c8f0'],
          [-0.2, -0.22, '#b9d68a'],
          [0.2, -0.25, '#fbf5e9'],
        ].map(([x, y, c], i) => (
          <mesh key={i} position={[x as number, y as number, 0.025]} rotation={[0, 0, (i - 2) * 0.08]} material={paint(c as string)}>
            <planeGeometry args={[0.24, 0.2]} />
          </mesh>
        ))}
      </group>
      <MedalFrame position={[-3.65, 2.3, -4.82]} />
      <RecognitionShelf position={[-3.65, 1.3, -4.66]} />
      <Bookshelf position={[-5.6, 0, -4.6]} w={2.2} h={3.2} rows={5} seed={3} />
      <Bookshelf position={[3.6, 0, -4.6]} w={1.6} h={2.4} rows={4} seed={8} />
      <Chair position={[2.6, 0, -1.4]} rot={-0.6} />
      <Lamp position={[3.6, 0, -2.4]} />
      <Rug position={[0.2, 0.01, -1.2]} w={4} d={2.8} />
      <Plant position={[1.75, 0, -4.3]} s={1.5} />
      <Frame position={[-5.9, 3.55, -4.82]} w={0.6} h={0.45} color="#a9bf8e" />
      <Frame position={[3.6, 3.0, -4.82]} w={0.5} h={0.6} color="#e9c98c" />
      <Frame position={[4.3, 3.3, -4.82]} w={0.4} h={0.4} color="#8ec5e8" />
    </group>
  );
}

/* ------------------------------------------------------------ workshop -- */

function Robot({ position }: { position: [number, number, number] }) {
  const head = useRef<THREE.Group>(null);
  const { hover, bind } = useHoverable('robot');
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, hover ? Math.sin(t * 6) * 0.4 : Math.sin(t * 0.6) * 0.3, 0.1);
  });
  const shell = paint('#e7b45a', { roughness: 0.4 });
  const eye = paint('#bff3ff', { emissive: '#7fe0ff', emissiveIntensity: hover ? 2.5 : 1.2 });
  return (
    <group position={position} {...bind}>
      <mesh position={[0, 0.12, 0]} geometry={geo.box} scale={[0.22, 0.2, 0.16]} material={shell} castShadow />
      {[-0.06, 0.06].map((x) => (
        <mesh key={x} position={[x, 0.02, 0]} geometry={geo.box} scale={[0.06, 0.04, 0.12]} material={paint('#3d3a35')} />
      ))}
      <group ref={head} position={[0, 0.28, 0]}>
        <mesh geometry={geo.box} scale={[0.24, 0.14, 0.18]} material={shell} castShadow />
        {[-0.05, 0.05].map((x) => (
          <mesh key={x} position={[x, 0.01, 0.091]} material={eye}>
            <circleGeometry args={[0.025, 12]} />
          </mesh>
        ))}
        <mesh position={[0, 0.12, 0]} geometry={geo.cyl} scale={[0.008, 0.12, 0.008]} material={paint('#3d3a35')} />
        <mesh position={[0, 0.19, 0]} material={paint('#e2394b', { emissive: '#e2394b', emissiveIntensity: 0.8 })}>
          <sphereGeometry args={[0.02, 8, 6]} />
        </mesh>
      </group>
      <mesh visible={false} position={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
      </mesh>
    </group>
  );
}

function Workshop() {
  const cx = ROOM_X[1];
  const wood = paint('#9b6239', { map: textures().planks });
  const monitor = useMemo(() => new THREE.MeshStandardMaterial({ map: screenTexture('terminal'), emissive: '#ffffff', emissiveMap: screenTexture('terminal'), emissiveIntensity: 0.9 }), []);
  return (
    <group position={[cx, 0, 0]}>
      {/* workbench */}
      <group position={[0, 0, -4.2]}>
        <mesh position={[0, 0.9, 0]} geometry={geo.box} scale={[5, 0.1, 1.0]} material={wood} castShadow receiveShadow />
        <mesh position={[0, 0.3, 0]} geometry={geo.box} scale={[4.8, 0.06, 0.9]} material={wood} receiveShadow />
        {[-2.4, 2.4].map((x) =>
          [-0.4, 0.4].map((z) => <mesh key={`${x}${z}`} position={[x, 0.45, z]} geometry={geo.box} scale={[0.1, 0.9, 0.1]} material={paint('#7a4f2e')} castShadow />),
        )}
        {/* monitor */}
        <group position={[-0.9, 0.95, -0.15]}>
          <mesh position={[0, 0.03, 0]} geometry={geo.box} scale={[0.3, 0.03, 0.2]} material={paint('#3d3a35')} />
          <mesh position={[0, 0.2, 0]} geometry={geo.box} scale={[0.05, 0.35, 0.05]} material={paint('#3d3a35')} />
          <mesh position={[0, 0.5, 0.02]} geometry={geo.box} scale={[1.05, 0.62, 0.05]} material={paint('#2b2a26')} castShadow />
          <mesh position={[0, 0.5, 0.05]} material={monitor}>
            <planeGeometry args={[0.97, 0.55]} />
          </mesh>
          <mesh position={[0, 0.03, 0.35]} geometry={geo.box} scale={[0.6, 0.025, 0.2]} material={paint('#e9e2d6')} />
        </group>
        <Robot position={[0.5, 0.95, 0.1]} />
        {/* toolbox */}
        <group position={[1.6, 0.95, 0]}>
          <mesh position={[0, 0.12, 0]} geometry={geo.box} scale={[0.6, 0.24, 0.3]} material={paint('#c2683f', { roughness: 0.5 })} castShadow />
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={paint('#3d3a35')}>
            <torusGeometry args={[0.12, 0.015, 6, 16, Math.PI]} />
          </mesh>
        </group>
        {/* gears */}
        {[
          [1.0, 0.98, 0.3, 0.12],
          [1.25, 0.98, 0.35, 0.08],
        ].map(([x, y, z, s], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]} material={paint('#b9b2a5', { metalness: 0.7, roughness: 0.35 })} castShadow>
            <torusGeometry args={[s, s * 0.35, 6, 10]} />
          </mesh>
        ))}
        {/* blueprints */}
        <mesh position={[-2.0, 0.96, 0.15]} rotation={[-Math.PI / 2, 0, 0.15]} material={paint('#4b7bb5')}>
          <planeGeometry args={[0.7, 0.5]} />
        </mesh>
        <mesh position={[-1.9, 0.965, 0.12]} rotation={[-Math.PI / 2, 0, -0.1]} material={paint('#f3e9d4')}>
          <planeGeometry args={[0.5, 0.36]} />
        </mesh>
      </group>
      {/* apothecary shelf: one labelled jar per skill */}
      <SkillJars position={[0, 0, -4.62]} />
      {/* drafting easel */}
      <group position={[-3.4, 0, -2.4]} rotation={[0, 0.5, 0]}>
        {[-0.4, 0.4].map((x) => (
          <mesh key={x} position={[x, 0.8, 0]} rotation={[0.15, 0, 0]} geometry={geo.box} scale={[0.05, 1.6, 0.05]} material={paint('#7a4f2e')} />
        ))}
        <mesh position={[0, 1.25, 0.12]} rotation={[-0.25, 0, 0]} geometry={geo.box} scale={[1.0, 0.75, 0.03]} material={paint('#fbf5e9')} castShadow />
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.2 + i * 0.15, 1.3 - i * 0.1, 0.15]} rotation={[-0.25, 0, 0]} material={paint(['#c2683f', '#7ba7d9', '#7fa35b'][i])}>
            <circleGeometry args={[0.08 + i * 0.02, 16]} />
          </mesh>
        ))}
      </group>
      {[-6.4, 6.4].map((x, i) => (
        <HangingBulb key={x} position={[x, H, -2.2 + i * 0.4]} len={1.0} />
      ))}
      <Rug position={[0, 0.01, -1.4]} w={3.6} d={2.2} />
      <Plant position={[3.4, 0, -3.2]} s={1.4} />
    </group>
  );
}

/* ------------------------------------------------------------- library -- */

function FeatureBook({ item, position, rot }: { item: (typeof research)[number]; position: [number, number, number]; rot: number }) {
  const ref = useRef<THREE.Group>(null);
  const { hover, bind } = useHoverable(`research:${item.id}`, () => {
    if (item.href) window.open(item.href, '_blank', 'noopener');
  });
  const cover = useMemo(() => paint(item.color, { roughness: 0.6 }), [item.color]);
  const gold = paint('#e7b45a', { metalness: 0.6, roughness: 0.3, emissive: '#7a5410', emissiveIntensity: 0.2 });
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 6);
    g.position.y = THREE.MathUtils.lerp(g.position.y, hover ? 0.12 : 0, k);
    g.position.z = THREE.MathUtils.lerp(g.position.z, hover ? 0.12 : 0, k);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, hover ? -rot * 0.6 + 0.25 : 0, k);
    (cover as THREE.MeshStandardMaterial).emissive.set(item.color);
    (cover as THREE.MeshStandardMaterial).emissiveIntensity = THREE.MathUtils.lerp((cover as THREE.MeshStandardMaterial).emissiveIntensity, hover ? 0.35 : 0, k);
  });
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <group ref={ref} {...bind}>
        <mesh position={[0, 0.22, 0]} geometry={geo.box} scale={[0.3, 0.44, 0.07]} material={cover} castShadow />
        <mesh position={[0, 0.22, 0]} geometry={geo.box} scale={[0.28, 0.42, 0.075]} material={paint('#f6eedc')} />
        <mesh position={[0, 0.22, 0.038]} geometry={geo.box} scale={[0.3, 0.44, 0.004]} material={cover} />
        <mesh position={[0, 0.3, 0.042]} geometry={geo.box} scale={[0.16, 0.025, 0.004]} material={gold} />
        <mesh position={[0, 0.16, 0.042]} rotation={[0, 0, Math.PI / 4]} geometry={geo.box} scale={[0.06, 0.06, 0.004]} material={gold} />
        <mesh visible={false} position={[0, 0.22, 0.05]}>
          <boxGeometry args={[0.36, 0.5, 0.2]} />
        </mesh>
      </group>
    </group>
  );
}

function Library() {
  const cx = ROOM_X[2];
  return (
    <group position={[cx, 0, 0]}>
      {[-5.6, -3.4, 3.4, 5.6].map((x, i) => (
        <Bookshelf key={x} position={[x, 0, -4.6]} w={2.2} h={3.9} rows={7} seed={20 + i} />
      ))}
      <Bookshelf position={[-7.6, 0, -1.5]} w={2.6} h={3.9} rows={7} seed={30} rot={Math.PI / 2} />
      {/* rolling ladder */}
      <group position={[-4.5, 0, -4.0]} rotation={[-0.18, 0, 0]}>
        {[-0.25, 0.25].map((x) => (
          <mesh key={x} position={[x, 1.9, 0]} geometry={geo.box} scale={[0.05, 3.8, 0.05]} material={paint('#7a4f2e')} castShadow />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[0, 0.3 + i * 0.36, 0]} geometry={geo.box} scale={[0.5, 0.04, 0.05]} material={paint('#7a4f2e')} />
        ))}
      </group>
      {/* display table with featured research books */}
      <group position={[1.6, 0, -1.6]}>
        <mesh position={[0, 0.8, 0]} geometry={geo.box} scale={[1.9, 0.08, 0.8]} material={paint('#7a4f2e', { map: textures().planks })} castShadow receiveShadow />
        {[
          [-0.85, -0.3],
          [0.85, -0.3],
          [-0.85, 0.3],
          [0.85, 0.3],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.4, z]} geometry={geo.box} scale={[0.08, 0.8, 0.08]} material={paint('#5e3d24')} castShadow />
        ))}
        <mesh position={[0, 0.88, 0]} geometry={geo.box} scale={[1.8, 0.06, 0.4]} material={paint('#2f4f4f')} />
        {research.map((item, i) => (
          <FeatureBook key={item.id} item={item} position={[(i - (research.length - 1) / 2) * Math.min(0.4, 1.5 / research.length), 0.91, 0.05]} rot={(i - (research.length - 1) / 2) * 0.1} />
        ))}
        {/* candle */}
        <group position={[0.8, 0.84, 0.25]}>
          <mesh position={[0, 0.08, 0]} geometry={geo.cyl} scale={[0.04, 0.16, 0.04]} material={paint('#fbf5e9')} />
          <mesh position={[0, 0.19, 0]} scale={[0.02, 0.04, 0.02]} material={paint('#ffd27a', { emissive: '#ffb347', emissiveIntensity: 3 })}>
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        </group>
      </group>
      {/* globe */}
      <group position={[4.2, 0, -1.8]}>
        <mesh position={[0, 0.45, 0]} geometry={geo.cyl} scale={[0.04, 0.9, 0.04]} material={paint('#7a4f2e')} />
        <mesh position={[0, 0.02, 0]} geometry={geo.cyl} scale={[0.25, 0.04, 0.25]} material={paint('#7a4f2e')} />
        <mesh position={[0, 1.05, 0]} rotation={[0.4, 0, 0.2]} material={paint('#7ba7d9', { roughness: 0.4 })} castShadow>
          <sphereGeometry args={[0.24, 24, 16]} />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation={[0.4, 0, 0.2]} material={paint('#b38b4a', { metalness: 0.6, roughness: 0.3 })}>
          <torusGeometry args={[0.28, 0.012, 6, 32]} />
        </mesh>
      </group>
      <Chair position={[-1.4, 0, -1.4]} rot={0.5} color="#8c3b3b" />
      <QuranStand position={[0.35, 0, -2.75]} rotation={0.15} />
      <Lamp position={[-2.4, 0, -2.2]} h={1.5} />
      <Rug position={[0.4, 0.01, -1.3]} w={4.6} d={2.6} />
      {/* book piles on the floor */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-0.2, 0.04 + i * 0.07, -0.3]} rotation={[0, i * 0.4, 0]} geometry={geo.box} scale={[0.42, 0.065, 0.3]} material={paint(['#3b5b8c', '#8c3b3b', '#e7b45a', '#4f6b3a', '#6b4a7a'][i])} castShadow />
      ))}
      <FloatingMotes center={[0, 0.4, -1.5]} extent={[10, 3.4, 5]} count={90} warm />
    </group>
  );
}

/* ------------------------------------------------------------- kitchen -- */

type DishId = (typeof recipes)[number]['id'];

function Dish({ id, position, children }: { id: DishId; position: [number, number, number]; children: ReactNode }) {
  const { hover, bind } = useHoverable(`recipe:${id}`, () => {
    setUI({ focusedRecipe: id });
    document.getElementById(`recipe-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  });
  return (
    <group position={position} {...bind}>
      <Lift active={hover}>{children}</Lift>
      <mesh visible={false} position={[0, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.5, 0.6]} />
      </mesh>
    </group>
  );
}

function Kitchen() {
  const cx = ROOM_X[3];
  ensureNightDoor();
  const t = textures();
  const zellige = useMemo(() => new THREE.MeshStandardMaterial({ map: zelligeTexture(), roughness: 0.3 }), []);
  const counter = paint('#e9e2d6', { roughness: 0.45 });
  const cabinet = paint('#7fa38c', { roughness: 0.7 });
  const copper = paint('#c27a4a', { metalness: 0.75, roughness: 0.3 });
  return (
    <group position={[cx, 0, 0]}>
      {/* backsplash */}
      <mesh position={[0.2, 1.55, -4.82]} material={zellige}>
        <planeGeometry args={[5.2, 1.1]} />
      </mesh>
      {/* base cabinets + counter */}
      <mesh position={[-1.6, 0.45, -4.5]} geometry={geo.box} scale={[8.8, 0.9, 0.7]} material={cabinet} castShadow receiveShadow />
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-5.4 + i * 1.08, 0.5, -4.14]} geometry={geo.box} scale={[0.85, 0.7, 0.02]} material={paint('#93b59f')} />
      ))}
      <mesh position={[-1.6, 0.93, -4.45]} geometry={geo.box} scale={[8.9, 0.07, 0.8]} material={counter} castShadow receiveShadow />
      {/* stove + pot */}
      <group position={[-1.0, 0.97, -4.45]}>
        <mesh position={[0, 0.01, 0]} geometry={geo.box} scale={[0.9, 0.02, 0.6]} material={paint('#2b2a26', { roughness: 0.4 })} />
        <mesh position={[-0.2, 0.14, 0]} material={copper} castShadow>
          <cylinderGeometry args={[0.2, 0.18, 0.26, 24]} />
        </mesh>
        <mesh position={[-0.2, 0.28, 0]} material={copper}>
          <cylinderGeometry args={[0.21, 0.21, 0.02, 24]} />
        </mesh>
        <mesh position={[-0.2, 0.32, 0]} material={paint('#2b2a26')}>
          <sphereGeometry args={[0.03, 8, 6]} />
        </mesh>
        <Steam position={[-0.2, 0.3, 0]} count={20} height={1.1} spread={0.14} size={70} />
        {/* kettle */}
        <group position={[0.26, 0.02, 0.05]}>
          <mesh position={[0, 0.12, 0]} scale={[1, 0.8, 1]} material={paint('#e2394b', { roughness: 0.35 })} castShadow>
            <sphereGeometry args={[0.13, 20, 14]} />
          </mesh>
          <mesh position={[0, 0.24, 0]} rotation={[0, 0, 0]} material={paint('#2b2a26')}>
            <torusGeometry args={[0.08, 0.012, 6, 16, Math.PI]} />
          </mesh>
          <mesh position={[0.14, 0.15, 0]} rotation={[0, 0, -0.9]} material={paint('#e2394b')}>
            <cylinderGeometry args={[0.012, 0.025, 0.12, 8]} />
          </mesh>
        </group>
      </group>
      {/* sink area + window */}
      <mesh position={[-3.5, 0.95, -4.45]} geometry={geo.box} scale={[0.9, 0.03, 0.5]} material={paint('#c9ccd1', { metalness: 0.6, roughness: 0.25 })} />
      {/* jars on open shelf */}
      <group position={[1.4, 2.4, -4.7]}>
        <mesh geometry={geo.box} scale={[2.6, 0.06, 0.35]} material={paint('#7a4f2e')} castShadow />
        {[
          ['#f2d16b', 0.26],
          ['#e7e1d3', 0.32],
          ['#c2683f', 0.22],
          ['#a9bf8e', 0.28],
          ['#8c3b3b', 0.24],
          ['#e9c98c', 0.3],
        ].map(([c, h], i) => (
          <group key={i} position={[-1.05 + i * 0.42, 0.03, 0]}>
            <mesh position={[0, (h as number) / 2, 0]} material={paint('#eef4f2', { roughness: 0.1, transparent: true, opacity: 0.5 })}>
              <cylinderGeometry args={[0.1, 0.1, h as number, 16]} />
            </mesh>
            <mesh position={[0, (h as number) * 0.35, 0]} material={paint(c as string)}>
              <cylinderGeometry args={[0.09, 0.09, (h as number) * 0.68, 16]} />
            </mesh>
            <mesh position={[0, (h as number) + 0.02, 0]} material={paint('#7a4f2e')}>
              <cylinderGeometry args={[0.105, 0.105, 0.04, 16]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* hanging pans */}
      <group position={[-1.2, 3.1, -4.4]}>
        <mesh geometry={geo.box} scale={[2.2, 0.04, 0.04]} material={paint('#3d3a35')} />
        {[-0.8, -0.25, 0.3, 0.8].map((x, i) => (
          <group key={x} position={[x, -0.15, 0.05]}>
            <mesh position={[0, -0.12 - i * 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} material={copper} castShadow>
              <cylinderGeometry args={[0.13 + (i % 2) * 0.03, 0.11, 0.05, 20]} />
            </mesh>
            <mesh position={[0, 0.02, 0]} geometry={geo.box} scale={[0.025, 0.2, 0.025]} material={copper} />
          </group>
        ))}
      </group>
      {/* herbs on sill */}
      <Plant position={[-4.0, 1.54, -4.72]} s={0.5} />
      <Plant position={[-3.1, 1.54, -4.72]} s={0.45} />

      {/* island with dishes */}
      <group position={[-0.9, 0, -0.9]}>
        <mesh position={[0, 0.45, 0]} geometry={geo.box} scale={[3.4, 0.9, 1.3]} material={paint('#9b6239', { map: t.planks })} castShadow receiveShadow />
        <mesh position={[0, 0.93, 0]} geometry={geo.box} scale={[3.6, 0.07, 1.45]} material={paint('#efe6d6', { roughness: 0.4 })} castShadow receiveShadow />
        <mesh position={[0, 0.968, 0.05]} geometry={geo.box} scale={[3.2, 0.005, 0.45]} material={paint('#c2683f')} />
        <Dish id="noodles" position={[-1.3, 0.97, 0.12]}>
          <Ramen />
        </Dish>
        <Dish id="chicken" position={[-0.55, 0.97, 0.0]}>
          <RoastChicken />
        </Dish>
        <Dish id="dessert" position={[0.2, 0.97, -0.1]}>
          <Cake />
        </Dish>
        <Dish id="pasta" position={[0.92, 0.97, 0.12]}>
          <WhiteSaucePasta />
        </Dish>
        <Dish id="sandwich" position={[1.5, 0.97, -0.15]}>
          <Sandwich />
        </Dish>
        <group position={[-1.4, 0.97, -0.45]}>
          <FruitBowl />
        </group>
      </group>
      {/* stools */}
      {[-1.8, -0.4, 1.0].map((x) => (
        <group key={x} position={[x, 0, 0.25]}>
          <mesh position={[0, 0.62, 0]} geometry={geo.cyl} scale={[0.22, 0.06, 0.22]} material={paint('#c2683f')} castShadow />
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[Math.cos(i * 2.1) * 0.13, 0.3, Math.sin(i * 2.1) * 0.13]} geometry={geo.cyl} scale={[0.02, 0.62, 0.02]} material={paint('#7a4f2e')} />
          ))}
        </group>
      ))}
      {/* back door to the night garden */}
      <group position={[3.6, 0, -5]}>
        <mesh position={[0, 1.2, -0.35]} material={nightDoorMat}>
          <planeGeometry args={[1.6, 2.6]} />
        </mesh>
        <mesh position={[0, 2.48, 0.18]} geometry={geo.box} scale={[1.45, 0.14, 0.12]} material={paint('#8a5a34')} />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.66, 1.2, 0.18]} geometry={geo.box} scale={[0.12, 2.4, 0.12]} material={paint('#8a5a34')} />
        ))}
      </group>
      {[-2.2, 0.4].map((x) => (
        <HangingBulb key={x} position={[x, H, -0.9]} len={1.3} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------ interior -- */

export function Interior() {
  const skies = useMemo(
    () => [
      windowSky('#7cc0ef', '#e6f4f8', '#fff6d6'),
      windowSky('#86bde6', '#f4ecd8', '#fff1c4'),
      windowSky('#e9a86a', '#f8dcae', '#ffe8b0'),
      windowSky('#59618f', '#e79b77', '#ffcf8a'),
    ],
    [],
  );
  const walls = ['#f4ebdc', '#efe4cf', '#efdcc4', '#f4e8d6'];
  return (
    <group position={[0, INTERIOR_Y, 0]}>
      {ROOM_X.map((x, i) => (
        <Room
          key={x}
          cx={x}
          wall={walls[i]}
          sky={skies[i]}
          leftDoor={i > 0}
          rightWall={i === ROOM_X.length - 1}
          windowX={i === 0 ? [-1.6] : i === 1 ? [-6.0] : i === 2 ? [0] : [-3.5]}
          windowSize={i === 2 ? [1.2, 1.4] : [1.8, 1.5]}
          backDoorX={i === 3 ? 3.6 : undefined}
        />
      ))}
      <Study />
      <Workshop />
      <Library />
      <Kitchen />
      <FloatingMotes center={[24, 0.6, 0]} extent={[60, 3.4, 8]} count={160} />
    </group>
  );
}
