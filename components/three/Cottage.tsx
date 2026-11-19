'use client';

import * as THREE from 'three';
import { useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { paint, textures, seeded, windify } from './materials';
import { Instanced, geo, type Inst, Flowers } from './Nature';
import { world, playBell, nav, setUI } from '@/lib/store';
import { Fanoos } from './Heritage';

/** Materials whose glow follows the time of day (driven from World). */
export const glow = {
  window: new THREE.MeshStandardMaterial({ color: '#ffd9a0', emissive: '#ffb45c', emissiveIntensity: 0.25, roughness: 0.6 }),
  doorway: new THREE.MeshStandardMaterial({ color: '#ffe2b0', emissive: '#ffc070', emissiveIntensity: 1.4, roughness: 1 }),
  lantern: new THREE.MeshStandardMaterial({ color: '#fff1c9', emissive: '#ffbf5e', emissiveIntensity: 0.2, roughness: 0.4 }),
};

const WOOD = '#8a5a34';
const WOOD_DARK = '#6b4428';
const WALL = '#f6efe2';

function slab(w: number, h: number, d: number) {
  return new THREE.BoxGeometry(w, h, d);
}

/** Front facade with real openings so the glowing interior shows through. */
function Facade({
  width,
  height,
  holes,
  position,
  rotation,
}: {
  width: number;
  height: number;
  holes: { x: number; y: number; w: number; h: number; round?: boolean }[];
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const geom = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(width / 2, height);
    s.lineTo(-width / 2, height);
    s.closePath();
    holes.forEach((h) => {
      const p = new THREE.Path();
      if (h.round) {
        p.absarc(h.x, h.y, h.w / 2, 0, Math.PI * 2, true);
      } else {
        p.moveTo(h.x - h.w / 2, h.y - h.h / 2);
        p.lineTo(h.x - h.w / 2, h.y + h.h / 2);
        p.lineTo(h.x + h.w / 2, h.y + h.h / 2);
        p.lineTo(h.x + h.w / 2, h.y - h.h / 2);
        p.closePath();
      }
      s.holes.push(p);
    });
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: false });
    return g;
  }, [width, height, holes]);
  const mat = useMemo(() => paint(WALL, { map: textures().plaster }), []);
  return <mesh geometry={geom} material={mat} position={position} rotation={rotation} castShadow receiveShadow />;
}

function Gable({ width, rise, position, rotation }: { width: number; rise: number; position: [number, number, number]; rotation?: [number, number, number] }) {
  const geom = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(0, rise);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: false });
  }, [width, rise]);
  return <mesh geometry={geom} material={paint(WALL, { map: textures().plaster })} position={position} rotation={rotation} castShadow receiveShadow />;
}

/** Window with frame, mullions, open shutters, curtains and a flower box. */
function Window({ x, y, z, w, h, box = true, colors = ['#f4a6c1', '#ffffff', '#f7c6d6'] }: { x: number; y: number; z: number; w: number; h: number; box?: boolean; colors?: string[] }) {
  const wood = paint(WOOD);
  return (
    <group position={[x, y, z]}>
      {/* glowing interior card */}
      <mesh position={[0, 0, -0.1]} material={glow.window}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {/* curtains */}
      <mesh position={[-w * 0.36, 0.05, -0.06]} material={paint('#fbeff0')}>
        <planeGeometry args={[w * 0.26, h * 0.92]} />
      </mesh>
      <mesh position={[w * 0.36, 0.05, -0.06]} material={paint('#fbeff0')}>
        <planeGeometry args={[w * 0.26, h * 0.92]} />
      </mesh>
      {/* frame */}
      {[
        [0, h / 2 + 0.05, w + 0.2, 0.12],
        [0, -h / 2 - 0.05, w + 0.25, 0.12],
      ].map(([px, py, sw, sh], i) => (
        <mesh key={i} position={[px, py, 0.08]} geometry={geo.box} scale={[sw, sh, 0.14]} material={wood} castShadow />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * w) / 2, 0, 0.08]} geometry={geo.box} scale={[0.1, h + 0.1, 0.14]} material={wood} castShadow />
      ))}
      <mesh position={[0, 0, 0.04]} geometry={geo.box} scale={[0.05, h, 0.05]} material={wood} />
      <mesh position={[0, h * 0.12, 0.04]} geometry={geo.box} scale={[w, 0.05, 0.05]} material={wood} />
      {/* shutters */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.06), 0, 0.1]} rotation={[0, s * 0.5, 0]}>
          <mesh position={[(s * w) / 4, 0, 0]} geometry={geo.box} scale={[w / 2, h, 0.05]} material={paint(WOOD)} castShadow />
          {[-0.3, 0, 0.3].map((yy) => (
            <mesh key={yy} position={[(s * w) / 4, yy * h, 0.03]} geometry={geo.box} scale={[w / 2 - 0.08, 0.03, 0.02]} material={paint(WOOD_DARK)} />
          ))}
        </group>
      ))}
      {box && (
        <group position={[0, -h / 2 - 0.2, 0.22]}>
          <mesh geometry={geo.box} scale={[w + 0.15, 0.22, 0.28]} material={paint('#9b6239')} castShadow />
          <Flowers patches={[{ x: 0, z: 0, w: w, d: 0.2, n: 26, colors, y: -0.02, size: 1.2 }]} seed={Math.floor(x * 10 + y * 3)} />
        </group>
      )}
    </group>
  );
}

function Door() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const g = world.gSmooth;
    const open = THREE.MathUtils.smoothstep(g, 0.6, 0.86) * (g < 1.5 ? 1 : 0);
    ref.current.rotation.y = open * 1.5;
    glow.doorway.emissiveIntensity = 0.6 + open * 2.2;
  });
  const wood = paint('#a0673a', { map: textures().planks });
  return (
    <group position={[-1.3, 0.4, 2.5]}>
      <mesh position={[0, 1.05, -0.12]} material={glow.doorway}>
        <planeGeometry args={[1.1, 2.1]} />
      </mesh>
      {/* frame */}
      <mesh position={[0, 2.18, 0.1]} geometry={geo.box} scale={[1.45, 0.18, 0.2]} material={paint(WOOD)} castShadow />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.64, 1.05, 0.1]} geometry={geo.box} scale={[0.16, 2.25, 0.2]} material={paint(WOOD)} castShadow />
      ))}
      <group ref={ref} position={[-0.55, 0, 0]}>
        <group position={[0.55, 1.05, 0.02]}>
          <mesh geometry={geo.box} scale={[1.1, 2.1, 0.08]} material={wood} castShadow />
          {/* window panes in the door */}
          {[-0.2, 0.2].map((xx) =>
            [0.55, 0.2].map((yy) => (
              <mesh key={`${xx}${yy}`} position={[xx, yy, 0.045]} material={glow.window}>
                <planeGeometry args={[0.3, 0.28]} />
              </mesh>
            )),
          )}
          <mesh position={[0, -0.45, 0.05]} geometry={geo.box} scale={[0.8, 0.7, 0.02]} material={paint(WOOD_DARK)} />
          <mesh position={[0.4, -0.05, 0.08]} material={paint('#d6a84f', { metalness: 0.7, roughness: 0.3 })}>
            <sphereGeometry args={[0.045, 10, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** The interactive brass doorbell — ring it to step inside. */
function Bell() {
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useFrame((_, dt) => {
    world.bell = Math.max(0, world.bell - dt * 0.45);
    if (!ref.current) return;
    const t = performance.now() / 1000;
    ref.current.rotation.z = Math.sin(t * 14) * 0.5 * world.bell + (hover ? Math.sin(t * 3) * 0.05 : 0);
  });
  const brass = paint('#d9a441', { metalness: 0.75, roughness: 0.28, emissive: '#6b4a10', emissiveIntensity: hover ? 0.6 : 0.1 });
  return (
    <group position={[-0.42, 2.45, 2.62]}>
      <mesh position={[0, 0.12, 0]} geometry={geo.box} scale={[0.06, 0.06, 0.32]} material={paint(WOOD_DARK)} />
      <group
        ref={ref}
        position={[0, 0.1, 0.16]}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHover(true);
          setUI({ hovered: 'bell' });
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHover(false);
          setUI({ hovered: null });
          document.body.style.cursor = '';
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          playBell();
          setTimeout(() => nav.scrollTo('about', { duration: 4 }), 450);
        }}
      >
        <mesh position={[0, -0.14, 0]} material={brass} castShadow>
          <cylinderGeometry args={[0.035, 0.12, 0.2, 16, 1, true]} />
        </mesh>
        <mesh position={[0, -0.04, 0]} material={brass}>
          <sphereGeometry args={[0.04, 10, 8]} />
        </mesh>
        <mesh position={[0, -0.25, 0]} material={brass}>
          <sphereGeometry args={[0.03, 8, 6]} />
        </mesh>
        {/* generous invisible hit area */}
        <mesh position={[0, -0.12, 0]} visible={false}>
          <sphereGeometry args={[0.3, 8, 6]} />
        </mesh>
      </group>
    </group>
  );
}

const ivyMat = windify(new THREE.MeshStandardMaterial({ roughness: 0.95 }), 0.03, 1, 1.2);
const wisteriaMat = windify(new THREE.MeshStandardMaterial({ roughness: 0.8 }), 0.05, 1, 1.4);

function Ivy() {
  const items = useMemo<Inst[]>(() => {
    const r = seeded(31);
    const out: Inst[] = [];
    const greens = ['#4f8a3a', '#5e9a42', '#6fae4c', '#3f7a35', '#7dbb55'];
    const add = (x: number, y: number, z: number, s: number) =>
      out.push({ p: [x, y, z], s: s * (0.7 + r() * 0.6), r: [r() * 3, r() * 3, r() * 3], c: greens[Math.floor(r() * greens.length)] });
    // main roof slopes (ridge along z, from y 4.6 at x=±3.2 to 7.0 at x=0)
    for (let i = 0; i < 260; i++) {
      const side = r() > 0.5 ? 1 : -1;
      const t = r();
      const z = -2.9 + r() * 5.8;
      if (side < 0 && r() < 0.35) continue;
      const x = 0.2 + t * 3.0;
      add(side * x, 7.2 - x * 0.857, z, 0.22);
    }
    // wing roof (ridge along x at y 4.9, eaves at z=±2.3, y 3.3)
    for (let i = 0; i < 170; i++) {
      const t = r();
      const x = -6.6 + r() * 3.9;
      add(x, 5.18 - t * 2.3 * 0.8, t * 2.3 * (r() > 0.4 ? 1 : -1), 0.2);
    }
    // gable edges on front
    for (let i = 0; i < 40; i++) {
      const t = r();
      const side = r() > 0.5 ? 1 : -1;
      add(side * t * 3.1, 7.15 - t * 3.1 * 0.857, 2.85, 0.18);
    }
    // cascading down the right corner and over the door
    for (let i = 0; i < 70; i++) add(2.85 + (r() - 0.5) * 0.25, 0.8 + r() * 3.8, 2.4 + r() * 0.25, 0.16);
    for (let i = 0; i < 26; i++) add(-1.3 + (r() - 0.5) * 1.6, 2.65 + r() * 0.35, 2.62, 0.15);
    return out;
  }, []);
  return <Instanced items={items} geometry={geo.blobHi} material={ivyMat} castShadow />;
}

function Wisteria() {
  const items = useMemo<Inst[]>(() => {
    const r = seeded(17);
    const out: Inst[] = [];
    const cols = ['#a58be0', '#8f73d4', '#c3aef0', '#b49ae6'];
    const drop = (x: number, top: number, z: number, len: number) => {
      for (let k = 0; k < 9; k++) {
        const t = k / 9;
        const s = 0.085 * (1 - t * 0.6);
        out.push({ p: [x + (r() - 0.5) * 0.08, top - t * len, z + (r() - 0.5) * 0.08], s: [s, s * 0.85, s], c: cols[Math.floor(r() * cols.length)] });
      }
    };
    for (let x = -6.5; x < -2.7; x += 0.22) drop(x + r() * 0.1, 3.4, 2.22 + r() * 0.1, 0.5 + r() * 0.5);
    for (let x = -2.6; x < -0.2; x += 0.24) drop(x, 2.9, 2.7, 0.35 + r() * 0.3);
    // bush of wisteria climbing the wing corner
    for (let i = 0; i < 40; i++) out.push({ p: [-2.75 + (r() - 0.5) * 0.4, 0.6 + r() * 2.4, 2.35], s: 0.09, c: cols[Math.floor(r() * 4)] });
    return out;
  }, []);
  return <Instanced items={items} geometry={geo.petal} material={wisteriaMat} />;
}

function RoofSlab({ w, len, angle, position, axis = 'z' }: { w: number; len: number; angle: number; position: [number, number, number]; axis?: 'x' | 'z' }) {
  const mat = paint('#ffffff', { map: textures().roof });
  return axis === 'z' ? (
    <mesh position={position} rotation={[0, 0, angle]} geometry={geo.box} scale={[w, 0.18, len]} material={mat} castShadow receiveShadow />
  ) : (
    <mesh position={position} rotation={[angle, 0, 0]} geometry={geo.box} scale={[len, 0.18, w]} material={mat} castShadow receiveShadow />
  );
}

export function Cottage() {
  const mainAngle = Math.atan2(2.4, 2.8);
  const wingAngle = Math.atan2(1.6, 2.0);
  const wood = paint(WOOD);
  const stone = paint('#b9b2a5', { roughness: 1 });

  return (
    <group>
      {/* plinth */}
      <mesh position={[-1.8, 0.2, 0]} geometry={geo.box} scale={[9.4, 0.4, 5.3]} material={stone} receiveShadow castShadow />
      {/* main body */}
      <mesh position={[0, 2.5, -0.15]} geometry={geo.box} scale={[5.6, 4.2, 4.7]} material={paint(WALL, { map: textures().plaster })} castShadow receiveShadow />
      <Facade
        width={5.6}
        height={4.2}
        position={[0, 0.4, 2.34]}
        holes={[
          { x: -1.3, y: 1.05, w: 1.1, h: 2.1 },
          { x: 1.25, y: 1.3, w: 1.3, h: 1.2 },
          { x: 0, y: 3.25, w: 1.4, h: 1.4 },
        ]}
      />
      <Gable width={5.6} rise={2.4} position={[0, 4.6, 2.34]} />
      <Gable width={5.6} rise={2.4} position={[0, 4.6, -2.5]} />
      <mesh position={[0, 5.55, 2.52]} material={glow.window}>
        <circleGeometry args={[0.28, 20]} />
      </mesh>
      <mesh position={[0, 5.55, 2.53]} material={wood}>
        <torusGeometry args={[0.3, 0.05, 6, 24]} />
      </mesh>
      <RoofSlab w={4.15} len={6.0} angle={mainAngle} position={[-1.45, 5.82, 0]} />
      <RoofSlab w={4.15} len={6.0} angle={-mainAngle} position={[1.45, 5.82, 0]} />
      {/* barge boards */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.45, 5.75, 2.98]} rotation={[0, 0, -s * mainAngle]} geometry={geo.box} scale={[4.15, 0.16, 0.1]} material={paint(WOOD_DARK)} castShadow />
      ))}
      {/* half-timbering on the main block */}
      <mesh position={[0, 4.62, 2.52]} geometry={geo.box} scale={[5.7, 0.14, 0.06]} material={wood} />
      {[-2.75, 2.75].map((x) => (
        <mesh key={x} position={[x, 2.5, 2.52]} geometry={geo.box} scale={[0.14, 4.2, 0.06]} material={wood} castShadow />
      ))}

      {/* wing */}
      <mesh position={[-4.6, 1.85, 0]} geometry={geo.box} scale={[3.6, 2.9, 4]} material={paint(WALL, { map: textures().plaster })} castShadow receiveShadow />
      <Gable width={4} rise={1.6} position={[-6.4, 3.3, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <RoofSlab axis="x" w={2.95} len={4.2} angle={wingAngle} position={[-4.65, 4.12, 1.12]} />
      <RoofSlab axis="x" w={2.95} len={4.2} angle={-wingAngle} position={[-4.65, 4.12, -1.12]} />
      {[
        [-6.3, 1.85, 0.12, 2.9, 0],
        [-2.9, 1.85, 0.12, 2.9, 0],
        [-4.6, 3.2, 3.6, 0.12, 0],
        [-4.6, 0.55, 3.6, 0.12, 0],
        [-5.55, 1.85, 0.1, 3.0, 0.62],
        [-3.65, 1.85, 0.1, 3.0, -0.62],
      ].map(([x, y, sx, sy, rot], i) => (
        <mesh key={i} position={[x, y, 2.03]} rotation={[0, 0, rot]} geometry={geo.box} scale={[sx, sy, 0.06]} material={wood} castShadow />
      ))}
      <Window x={-4.6} y={1.85} z={2.14} w={0.95} h={1.0} />
      {/* little dormer chimney */}
      <mesh position={[-5.2, 4.9, -0.6]} geometry={geo.box} scale={[0.6, 1.6, 0.6]} material={paint('#e9e1d3')} castShadow />
      <mesh position={[-5.2, 5.75, -0.6]} geometry={geo.box} scale={[0.75, 0.14, 0.75]} material={stone} />
      <mesh position={[1.6, 7.0, -1.0]} geometry={geo.box} scale={[0.55, 1.5, 0.55]} material={paint('#e9e1d3')} castShadow />
      <mesh position={[1.6, 7.8, -1.0]} geometry={geo.box} scale={[0.7, 0.14, 0.7]} material={stone} />

      {/* main windows */}
      <Window x={1.25} y={1.7} z={2.46} w={1.3} h={1.2} />
      <Window x={0} y={3.65} z={2.46} w={1.4} h={1.4} box={false} />

      {/* balcony */}
      <group position={[0, 2.82, 2.95]}>
        <mesh geometry={geo.box} scale={[3.1, 0.14, 0.95]} material={paint('#9b6239', { map: textures().planks })} castShadow receiveShadow />
        {[-1.2, 0, 1.2].map((x) => (
          <mesh key={x} position={[x, -0.3, -0.1]} rotation={[0.6, 0, 0]} geometry={geo.box} scale={[0.1, 0.55, 0.1]} material={wood} />
        ))}
        <mesh position={[0, 0.72, 0.42]} geometry={geo.box} scale={[3.1, 0.08, 0.1]} material={wood} castShadow />
        {[-1.5, 1.5].map((x) => (
          <mesh key={x} position={[x, 0.72, 0]} geometry={geo.box} scale={[0.08, 0.08, 0.9]} material={wood} />
        ))}
        {Array.from({ length: 15 }, (_, i) => -1.47 + i * 0.21).map((x) => (
          <mesh key={x} position={[x, 0.36, 0.42]} geometry={geo.box} scale={[0.05, 0.7, 0.05]} material={wood} castShadow />
        ))}
        <mesh position={[0, 0.88, 0.45]} geometry={geo.box} scale={[3.0, 0.2, 0.26]} material={paint('#9b6239')} />
        <Flowers
          patches={[
            { x: 0, z: 0.45, w: 2.9, d: 0.2, n: 120, colors: ['#f4a6c1', '#ffffff', '#f7c6d6', '#ef7fa5'], y: 0.86, size: 1.3 },
            { x: 0, z: 0.6, w: 3.0, d: 0.1, n: 40, colors: ['#f4a6c1', '#ffffff'], y: 0.55, size: 1.1 },
          ]}
          seed={55}
        />
      </group>

      {/* front steps + railings */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-1.3, (3 - i) * 0.0667, 2.75 + i * 0.28]} geometry={geo.box} scale={[1.5, (3 - i) * 0.1334, 0.3]} material={stone} castShadow receiveShadow />
      ))}
      {[-2.1, -0.5].map((x) => (
        <group key={x}>
          {[2.6, 3.45].map((z, k) => (
            <mesh key={z} position={[x, 0.55 - k * 0.12, z]} geometry={geo.box} scale={[0.08, 0.9 - k * 0.12, 0.08]} material={wood} castShadow />
          ))}
          <mesh position={[x, 1.0, 3.02]} rotation={[0.3, 0, 0]} geometry={geo.box} scale={[0.07, 0.07, 0.95]} material={wood} />
        </group>
      ))}

      <Door />
      <Bell />
      {/* fanoos lanterns on the porch */}
      <Fanoos position={[0.55, 2.75, 3.2]} chain={0.2} scale={1.35} />
      <Fanoos position={[-3.7, 3.3, 2.45]} chain={0.3} scale={1.25} />
      <Ivy />
      <Wisteria />

      {/* hanging planters & pots */}
      {[
        [-2.35, 0.55, 3.1],
        [-0.2, 0.55, 3.0],
        [2.2, 0.55, 3.0],
        [0.9, 0.55, 3.1],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh material={paint('#c0703f')} castShadow>
            <cylinderGeometry args={[0.17, 0.12, 0.26, 10]} />
          </mesh>
          <Flowers patches={[{ x: 0, z: 0, w: 0.3, d: 0.3, n: 14, colors: i % 2 ? ['#ffffff', '#f2d16b'] : ['#ef7fa5', '#f4a6c1'], y: 0.05, size: 1.2 }]} seed={i + 90} />
        </group>
      ))}
    </group>
  );
}
