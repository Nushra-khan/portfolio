'use client';

import * as THREE from 'three';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { windify, seeded, paint } from './materials';

export type Inst = {
  p: [number, number, number];
  s: number | [number, number, number];
  r?: [number, number, number];
  c?: string;
};

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

/** Instanced mesh from a list of transforms + colours. */
export function Instanced({
  items,
  geometry,
  material,
  castShadow = false,
  receiveShadow = false,
}: {
  items: Inst[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current!;
    items.forEach((it, i) => {
      _e.set(...(it.r ?? [0, 0, 0]));
      _q.setFromEuler(_e);
      _v.set(...it.p);
      if (typeof it.s === 'number') _s.setScalar(it.s);
      else _s.set(...it.s);
      _m.compose(_v, _q, _s);
      mesh.setMatrixAt(i, _m);
      if (it.c) mesh.setColorAt(i, _c.set(it.c));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items, geometry, material]);
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, items.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={false}
    />
  );
}

export const geo = {
  blob: new THREE.IcosahedronGeometry(1, 1),
  blobHi: new THREE.IcosahedronGeometry(1, 2),
  sphere: new THREE.SphereGeometry(1, 12, 10),
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
  cone: new THREE.ConeGeometry(1, 1, 7),
  blade: (() => {
    const g = new THREE.ConeGeometry(0.05, 1, 3, 1);
    g.translate(0, 0.5, 0);
    return g;
  })(),
  petal: new THREE.IcosahedronGeometry(1, 1),
};

const leafMat = windify(new THREE.MeshStandardMaterial({ roughness: 0.95, color: '#ffffff' }), 0.12, 3, 0.8);
const leafMatLow = windify(new THREE.MeshStandardMaterial({ roughness: 0.95, color: '#ffffff' }), 0.04, 1, 1.2);
const grassMat = windify(new THREE.MeshStandardMaterial({ roughness: 1, color: '#ffffff' }), 0.18, 1, 1.4);
const flowerMat = windify(new THREE.MeshStandardMaterial({ roughness: 0.7, color: '#ffffff' }), 0.06, 0.5, 1.5);

const GREENS = ['#4f8a3a', '#5e9a42', '#6fae4c', '#3f7a35', '#7dbb55', '#8bc45c'];

/** A big, generous canopy tree like the one shading the cottage. */
export function BigTree({ position = [0, 0, 0] as [number, number, number], scale = 1, seed = 1 }) {
  const r = seeded(seed);
  const canopy = useMemo<Inst[]>(() => {
    const out: Inst[] = [];
    const clusters: [number, number, number, number][] = [
      [0, 8.6, 0, 3.4],
      [-3.6, 8.0, 0.8, 3.0],
      [3.4, 8.3, 0.4, 3.0],
      [-6.4, 7.0, 1.2, 2.4],
      [6.0, 7.4, 1.6, 2.4],
      [0.5, 10.6, -0.5, 2.8],
      [-2.0, 6.8, 2.6, 2.2],
      [2.6, 6.9, 2.8, 2.2],
      [8.2, 6.4, 3.0, 1.9],
    ];
    clusters.forEach(([x, y, z, rad]) => {
      for (let i = 0; i < 9; i++) {
        const a = r() * Math.PI * 2;
        const d = r() * rad * 0.75;
        out.push({
          p: [x + Math.cos(a) * d, y + (r() - 0.4) * rad * 0.6, z + Math.sin(a) * d],
          s: rad * (0.45 + r() * 0.35),
          r: [r() * 3, r() * 3, r() * 3],
          c: GREENS[Math.floor(r() * GREENS.length)],
        });
      }
    });
    return out;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const branches = useMemo(() => {
    const list: { from: THREE.Vector3; to: THREE.Vector3; r: number }[] = [
      { from: new THREE.Vector3(0, 4.2, 0), to: new THREE.Vector3(-5.6, 7.4, 1), r: 0.38 },
      { from: new THREE.Vector3(0, 4.6, 0), to: new THREE.Vector3(5.4, 7.6, 1.2), r: 0.38 },
      { from: new THREE.Vector3(0, 5.5, 0), to: new THREE.Vector3(0.6, 10, -0.4), r: 0.42 },
      { from: new THREE.Vector3(0, 5, 0), to: new THREE.Vector3(-1.8, 7.2, 2.6), r: 0.26 },
      { from: new THREE.Vector3(0, 5, 0), to: new THREE.Vector3(2.4, 7, 2.6), r: 0.26 },
    ];
    return list.map(({ from, to, r: rad }) => {
      const dir = to.clone().sub(from);
      const len = dir.length();
      const mid = from.clone().add(to).multiplyScalar(0.5);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      return { mid, len, q, rad };
    });
  }, []);

  const bark = paint('#7a5a3f', { roughness: 1 });
  const trunkGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.75, 1.35, 6, 14, 6);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const a = Math.atan2(pos.getZ(i), pos.getX(i));
      const bulge = 1 + Math.sin(a * 5 + y) * 0.08 + (y < -2.4 ? 0.35 : 0);
      pos.setX(i, pos.getX(i) * bulge);
      pos.setZ(i, pos.getZ(i) * bulge);
    }
    g.computeVertexNormals();
    g.translate(0, 3, 0);
    return g;
  }, []);

  return (
    <group position={position} scale={scale}>
      <mesh geometry={trunkGeo} material={bark} castShadow receiveShadow />
      {branches.map((b, i) => (
        <mesh key={i} position={b.mid} quaternion={b.q} material={bark} castShadow>
          <cylinderGeometry args={[b.rad * 0.55, b.rad, b.len, 8]} />
        </mesh>
      ))}
      <Instanced items={canopy} geometry={geo.blobHi} material={leafMat} castShadow />
    </group>
  );
}

/** Small round tree for the background. */
export function RoundTree({ position, scale = 1, tint = 0 }: { position: [number, number, number]; scale?: number; tint?: number }) {
  const items = useMemo<Inst[]>(() => {
    const r = seeded(Math.floor(position[0] * 13 + position[2] * 7 + 99));
    return Array.from({ length: 6 }, () => ({
      p: [(r() - 0.5) * 1.6, 2.6 + r() * 1.6, (r() - 0.5) * 1.6] as [number, number, number],
      s: 1 + r() * 0.7,
      r: [r(), r(), r()] as [number, number, number],
      c: GREENS[(Math.floor(r() * 4) + tint) % GREENS.length],
    }));
  }, [position, tint]);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.2, 0]} material={paint('#6e5038')} castShadow>
        <cylinderGeometry args={[0.18, 0.3, 2.4, 7]} />
      </mesh>
      <Instanced items={items} geometry={geo.blobHi} material={leafMat} castShadow />
    </group>
  );
}

/** Rounded shrubs. */
export function Bushes({ spots, seed = 3 }: { spots: [number, number, number, number][]; seed?: number }) {
  const items = useMemo<Inst[]>(() => {
    const r = seeded(seed);
    const out: Inst[] = [];
    spots.forEach(([x, y, z, s]) => {
      for (let i = 0; i < 5; i++)
        out.push({
          p: [x + (r() - 0.5) * s * 1.2, y + s * 0.45 + r() * s * 0.3, z + (r() - 0.5) * s * 0.9],
          s: s * (0.45 + r() * 0.3),
          r: [r() * 3, r() * 3, r() * 3],
          c: GREENS[Math.floor(r() * GREENS.length)],
        });
    });
    return out;
  }, [spots, seed]);
  return <Instanced items={items} geometry={geo.blobHi} material={leafMatLow} castShadow receiveShadow />;
}

export type FlowerPatch = { x: number; z: number; w: number; d: number; n: number; colors: string[]; y?: number; size?: number };

/** Clusters of tiny flower heads on short stems. */
export function Flowers({ patches, seed = 11 }: { patches: FlowerPatch[]; seed?: number }) {
  const { heads, leaves } = useMemo(() => {
    const r = seeded(seed);
    const heads: Inst[] = [];
    const leaves: Inst[] = [];
    patches.forEach((p) => {
      for (let i = 0; i < p.n; i++) {
        const x = p.x + (r() - 0.5) * p.w;
        const z = p.z + (r() - 0.5) * p.d;
        const h = (p.y ?? 0) + 0.18 + r() * 0.35;
        const size = (p.size ?? 1) * (0.07 + r() * 0.05);
        heads.push({ p: [x, h, z], s: [size, size * 0.7, size], r: [r(), r() * 6, 0], c: p.colors[Math.floor(r() * p.colors.length)] });
        if (i % 2 === 0)
          leaves.push({ p: [x, (p.y ?? 0) + 0.08, z], s: [0.16, 0.12, 0.16], r: [0, r() * 6, 0], c: GREENS[Math.floor(r() * 4)] });
      }
    });
    return { heads, leaves };
  }, [patches, seed]);
  return (
    <>
      <Instanced items={heads} geometry={geo.petal} material={flowerMat} />
      <Instanced items={leaves} geometry={geo.blob} material={leafMatLow} receiveShadow />
    </>
  );
}

/** Tall spiky lupin-like flowers. */
export function Spires({ spots, color, seed = 5 }: { spots: [number, number][]; color: string; seed?: number }) {
  const items = useMemo<Inst[]>(() => {
    const r = seeded(seed);
    const out: Inst[] = [];
    spots.forEach(([x, z]) => {
      const h = 0.7 + r() * 0.5;
      for (let k = 0; k < 7; k++) {
        const y = 0.35 + (k / 7) * h;
        const s = 0.09 * (1 - k / 9);
        out.push({ p: [x + (r() - 0.5) * 0.03, y, z], s: [s, s * 0.8, s], c: k % 2 ? color : new THREE.Color(color).offsetHSL(0, 0, 0.08).getStyle() });
      }
    });
    return out;
  }, [spots, color, seed]);
  return <Instanced items={items} geometry={geo.petal} material={flowerMat} />;
}

/** Wind-swept grass tufts scattered across an area, avoiding a list of clearings. */
export function Grass({
  count,
  area,
  avoid = [],
  seed = 21,
}: {
  count: number;
  area: [number, number, number, number];
  avoid?: ((x: number, z: number) => boolean)[];
  seed?: number;
}) {
  const items = useMemo<Inst[]>(() => {
    const r = seeded(seed);
    const out: Inst[] = [];
    let guard = 0;
    while (out.length < count && guard++ < count * 4) {
      const x = area[0] + r() * (area[2] - area[0]);
      const z = area[1] + r() * (area[3] - area[1]);
      if (avoid.some((f) => f(x, z))) continue;
      const h = 0.25 + r() * 0.35;
      out.push({
        p: [x, 0, z],
        s: [1 + r(), h, 1 + r()],
        r: [(r() - 0.5) * 0.4, r() * 6, (r() - 0.5) * 0.4],
        c: ['#6fae4c', '#7dbb55', '#8bc45c', '#5e9a42', '#9ccc66'][Math.floor(r() * 5)],
      });
    }
    return out;
  }, [count, area, avoid, seed]);
  return <Instanced items={items} geometry={geo.blade} material={grassMat} />;
}

export const cloudMat = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  emissive: '#e8eef8',
  emissiveIntensity: 0.55,
  roughness: 1,
  fog: false,
});

/** Puffy cumulus clouds. */
export function Clouds({ spots }: { spots: [number, number, number, number][] }) {
  const items = useMemo<Inst[]>(() => {
    const r = seeded(77);
    const out: Inst[] = [];
    spots.forEach(([x, y, z, s]) => {
      for (let i = 0; i < 8; i++)
        out.push({
          p: [x + (r() - 0.5) * s * 3.2, y + r() * s * 0.6, z + (r() - 0.5) * s * 0.8],
          s: s * (0.5 + r() * 0.6),
        });
    });
    return out;
  }, [spots]);
  return <Instanced items={items} geometry={geo.blobHi} material={cloudMat} />;
}
