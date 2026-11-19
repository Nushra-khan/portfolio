'use client';

import * as THREE from 'three';
import { useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { paint, seeded, shared } from './materials';
import { BigTree, RoundTree, Bushes, Flowers, Spires, Grass, Clouds, Instanced, geo, type Inst } from './Nature';
import { Cottage, glow } from './Cottage';
import { crescentTexture } from './Heritage';
import { setUI } from '@/lib/store';
import { site } from '@/content/site';

/* ------------------------------------------------------------------ sky -- */

export const skyUniforms = {
  uTop: { value: new THREE.Color('#5aa8e6') },
  uHorizon: { value: new THREE.Color('#d8ecf5') },
  uNight: { value: 0 },
};

function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { ...skyUniforms, uTime: shared.uTime },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uTop; uniform vec3 uHorizon; uniform float uNight; uniform float uTime;
          varying vec3 vDir;
          float hash(vec3 p){ p = fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
          void main() {
            float h = clamp(vDir.y, 0.0, 1.0);
            vec3 col = mix(uHorizon, uTop, pow(h, 0.55));
            // stars
            vec3 cell = floor(vDir * 180.0);
            float s = hash(cell);
            float tw = 0.6 + 0.4 * sin(uTime * 2.0 + s * 40.0);
            float star = step(0.9965, s) * smoothstep(0.05, 0.3, h) * tw;
            col += vec3(1.0, 0.95, 0.85) * star * uNight;
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[220, 32, 16]} />
    </mesh>
  );
}

export const celestial = {
  sun: new THREE.MeshBasicMaterial({ color: '#fff4d6', fog: false, transparent: true }),
  moon: new THREE.MeshBasicMaterial({ color: '#f6f1df', fog: false, transparent: true, opacity: 0 }),
};

/* --------------------------------------------------------------- ground -- */

const STREAM_Z = [9.3, 11.7];
const pathPts = [
  new THREE.Vector3(-0.4, 0, 12.2),
  new THREE.Vector3(-0.5, 0, 8.6),
  new THREE.Vector3(0.1, 0, 6.6),
  new THREE.Vector3(-0.8, 0, 4.6),
  new THREE.Vector3(-1.3, 0, 3.55),
];
const pathCurve = new THREE.CatmullRomCurve3(pathPts);
const nearPath = (x: number, z: number) => {
  if (z > 12.4 || z < 3.4) return false;
  for (let i = 0; i <= 24; i++) {
    const p = pathCurve.getPoint(i / 24);
    if ((p.x - x) ** 2 + (p.z - z) ** 2 < 0.8) return true;
  }
  return false;
};
const inStream = (_x: number, z: number) => z > STREAM_Z[0] - 0.3 && z < STREAM_Z[1] + 0.3;
const inHouse = (x: number, z: number) => x > -6.8 && x < 3.2 && z > -3 && z < 3.6;

const rockMat = new THREE.MeshStandardMaterial({ roughness: 1 });
const stoneMat = new THREE.MeshStandardMaterial({ roughness: 1 });

function Ground() {
  const grass = paint('#79b453', { roughness: 1 });
  const grassFar = paint('#8cc062', { roughness: 1 });
  const stones = useMemo<Inst[]>(() => {
    const r = seeded(4);
    const out: Inst[] = [];
    for (let i = 0; i <= 15; i++) {
      const t = i / 15;
      const p = pathCurve.getPoint(Math.min(1, 0.27 + t * 0.73));
      for (let k = 0; k < 2; k++)
        out.push({
          p: [p.x + (k - 0.5) * 0.55 + (r() - 0.5) * 0.15, 0.03, p.z + (r() - 0.5) * 0.12],
          s: [0.26 + r() * 0.08, 0.04, 0.2 + r() * 0.06],
          r: [0, r() * 3, 0],
          c: ['#d8d3c6', '#cbc5b6', '#e2ddcf'][Math.floor(r() * 3)],
        });
    }
    return out;
  }, []);
  const rocks = useMemo<Inst[]>(() => {
    const r = seeded(8);
    const out: Inst[] = [];
    for (let x = -26; x < 26; x += 0.9) {
      for (const bank of [STREAM_Z[0] - 0.05, STREAM_Z[1] + 0.05]) {
        if (Math.abs(x + 0.45) < 1.1) continue;
        out.push({
          p: [x + r() * 0.5, -0.05 + r() * 0.08, bank + (r() - 0.5) * 0.3],
          s: [0.35 + r() * 0.3, 0.22 + r() * 0.15, 0.3 + r() * 0.2],
          r: [r(), r() * 3, r()],
          c: ['#9aa38a', '#8a967a', '#a7ad98', '#7f9a62'][Math.floor(r() * 4)],
        });
      }
    }
    return out;
  }, []);

  const water = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#4f9cc4',
        roughness: 0.12,
        metalness: 0.2,
        emissive: '#1d4d6e',
        emissiveIntensity: 0.35,
      }),
    [],
  );

  return (
    <group>
      {/* meadow behind the stream */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (STREAM_Z[0] - 70) / 2]} material={grass} receiveShadow>
        <planeGeometry args={[160, 70 + STREAM_Z[0]]} />
      </mesh>
      {/* bank in front */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, STREAM_Z[1] + 15]} material={grass} receiveShadow>
        <planeGeometry args={[160, 30]} />
      </mesh>
      {/* stream bed + water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 10.5]} material={paint('#5d6e4d')}>
        <planeGeometry args={[160, 3]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 10.5]} material={water} receiveShadow>
        <planeGeometry args={[160, 2.6]} />
      </mesh>
      <Instanced items={stones} geometry={geo.cyl} material={stoneMat} receiveShadow />
      <Instanced items={rocks} geometry={geo.blobHi} material={rockMat} receiveShadow castShadow />
      {/* rolling hills */}
      {[
        [-40, -55, 26, 7],
        [-8, -62, 30, 9],
        [28, -58, 26, 7.5],
        [55, -40, 20, 6],
        [-60, -35, 18, 6],
      ].map(([x, z, s, h], i) => (
        <mesh key={i} position={[x, -1, z]} scale={[s, h, s * 0.6]} material={grassFar}>
          <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      ))}
      {/* field strip on the right like a rice paddy */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[18, 0.01, -6]} material={paint('#9fd06a', { roughness: 1 })} receiveShadow>
        <planeGeometry args={[20, 24]} />
      </mesh>
    </group>
  );
}

function Bridge() {
  const wood = paint('#a77a4a');
  const dark = paint('#7a5433');
  const planks = useMemo(() => {
    const out: { z: number; y: number; rot: number }[] = [];
    const n = 14;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const z = 8.8 + t * 3.5;
      const y = 0.06 + Math.sin(t * Math.PI) * 0.42;
      const rot = -Math.cos(t * Math.PI) * 0.36;
      out.push({ z, y, rot });
    }
    return out;
  }, []);
  return (
    <group position={[-0.45, 0, 0]}>
      {planks.map((p, i) => (
        <mesh key={i} position={[0, p.y, p.z]} rotation={[p.rot, 0, 0]} geometry={geo.box} scale={[1.35, 0.07, 0.24]} material={i % 3 ? wood : dark} castShadow receiveShadow />
      ))}
      {[-0.68, 0.68].map((x) => (
        <group key={x}>
          {planks
            .filter((_, i) => i % 3 === 0 || i === planks.length - 1)
            .map((p, i) => (
              <mesh key={i} position={[x, p.y + 0.38, p.z]} geometry={geo.box} scale={[0.08, 0.75, 0.08]} material={dark} castShadow />
            ))}
          {planks.slice(0, -1).map((p, i) => {
            const q = planks[i + 1];
            return (
              <mesh
                key={`r${i}`}
                position={[x, (p.y + q.y) / 2 + 0.74, (p.z + q.z) / 2]}
                rotation={[-Math.atan2(q.y - p.y, q.z - p.z), 0, 0]}
                geometry={geo.box}
                scale={[0.07, 0.07, Math.hypot(q.y - p.y, q.z - p.z) + 0.02]}
                material={wood}
              />
            );
          })}
        </group>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------- lantern -- */

export const LANTERNS: [number, number, number][] = [
  [0.95, 0, 7.6],
  [-2.2, 0, 5.4],
  [-3.4, 0, 8.9],
  [2.3, 0, 9.0],
];

function Lantern({ position }: { position: [number, number, number] }) {
  const dark = paint('#3d3a35', { metalness: 0.4, roughness: 0.5 });
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} geometry={geo.cyl} scale={[0.04, 1.1, 0.04]} material={dark} castShadow />
      <mesh position={[0, 1.22, 0]} material={glow.lantern}>
        <boxGeometry args={[0.18, 0.24, 0.18]} />
      </mesh>
      <mesh position={[0, 1.4, 0]} material={dark}>
        <coneGeometry args={[0.17, 0.14, 4]} />
      </mesh>
      <mesh position={[0, 1.1, 0]} geometry={geo.box} scale={[0.2, 0.03, 0.2]} material={dark} />
    </group>
  );
}

/* -------------------------------------------------------------- mailbox -- */

export const MAILBOX: [number, number, number] = [3.3, 0, 5.4];

function Mailbox() {
  const flag = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const letter = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 6);
    if (flag.current) flag.current.rotation.z = THREE.MathUtils.lerp(flag.current.rotation.z, hover ? -Math.PI / 2 : 0, k);
    if (lid.current) lid.current.rotation.x = THREE.MathUtils.lerp(lid.current.rotation.x, hover ? 0.9 : 0, k);
    if (letter.current) letter.current.position.y = THREE.MathUtils.lerp(letter.current.position.y, hover ? 0.32 : 0.05, k);
  });
  const red = paint('#c2683f', { roughness: 0.55, emissive: '#3a1406', emissiveIntensity: hover ? 0.5 : 0.1 });
  const wood = paint('#7a5433');
  return (
    <group
      position={MAILBOX}
      rotation={[0, -0.5, 0]}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(true);
        setUI({ hovered: 'mailbox' });
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        setUI({ hovered: null });
        document.body.style.cursor = '';
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        window.location.href = `mailto:${site.email}`;
      }}
    >
      <mesh position={[0, 0.55, 0]} geometry={geo.box} scale={[0.12, 1.1, 0.12]} material={wood} castShadow />
      <group position={[0, 1.22, 0]}>
        <mesh geometry={geo.box} scale={[0.42, 0.3, 0.62]} material={red} castShadow />
        <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.21, 0.31, 0.21]} material={red} castShadow>
          <cylinderGeometry args={[1, 1, 2, 16, 1, false, -Math.PI / 2, Math.PI]} />
        </mesh>
        <group ref={lid} position={[0, -0.15, 0.31]}>
          <mesh position={[0, 0.2, 0.01]} geometry={geo.box} scale={[0.4, 0.48, 0.03]} material={paint('#a8532f')} />
          <mesh position={[0, 0.25, 0.04]} material={glow.lantern}>
            <circleGeometry args={[0.045, 12]} />
          </mesh>
        </group>
        <mesh ref={letter} position={[0, 0.05, 0.12]} rotation={[0, 0, 0]} material={paint('#fbf5e9')}>
          <boxGeometry args={[0.3, 0.22, 0.01]} />
        </mesh>
        <group ref={flag} position={[0.23, 0.05, -0.15]}>
          <mesh position={[0, 0.2, 0]} geometry={geo.box} scale={[0.03, 0.4, 0.03]} material={paint('#e7b45a')} />
          <mesh position={[0, 0.34, 0.07]} geometry={geo.box} scale={[0.02, 0.12, 0.14]} material={paint('#e7b45a')} />
        </group>
      </group>
      <mesh position={[0, 0.9, 0]} visible={false}>
        <boxGeometry args={[1, 1.8, 1]} />
      </mesh>
      <Flowers patches={[{ x: 0, z: 0, w: 0.9, d: 0.7, n: 40, colors: ['#ffffff', '#f2d16b', '#ef7fa5'] }]} seed={66} />
    </group>
  );
}


/* ------------------------------------------------------------- exterior -- */

export function Exterior({ tier }: { tier: 'high' | 'low' }) {
  const hi = tier === 'high';
  useMemo(() => {
    if (!celestial.moon.map) {
      celestial.moon.map = crescentTexture();
      celestial.moon.depthWrite = false;
      celestial.moon.needsUpdate = true;
    }
  }, []);
  const grassAvoid = useMemo(() => [nearPath, inStream, inHouse], []);

  return (
    <group>
      <Sky />
      <mesh position={[-38, 46, -150]} material={celestial.sun}>
        <circleGeometry args={[7, 32]} />
      </mesh>
      <mesh position={[-88.6, 19.5, -53.3]} rotation={[0, 0.97, 0]} material={celestial.moon}>
        <planeGeometry args={[16, 16]} />
      </mesh>
      <Clouds
        spots={[
          [34, 22, -70, 4.5],
          [-30, 26, -80, 5],
          [10, 30, -95, 4],
          [48, 16, -60, 3.6],
          [-55, 18, -60, 3.5],
        ]}
      />
      <Ground />
      <Cottage />
      <BigTree position={[-1.5, 0, -6]} scale={1.05} />
      {[
        [-18, 0, -14, 1.4, 0],
        [-24, 0, -22, 1.8, 1],
        [-12, 0, -26, 1.6, 2],
        [14, 0, -22, 1.5, 1],
        [22, 0, -28, 1.9, 0],
        [30, 0, -18, 1.4, 2],
        [-34, 0, -10, 1.6, 1],
        [6, 0, -34, 2.2, 0],
        [-14, 0, 4, 1.1, 2],
        [12, 0, 1, 1.0, 1],
      ].map(([x, y, z, s, t], i) => (
        <RoundTree key={i} position={[x, y, z]} scale={s} tint={t} />
      ))}
      <Bridge />
      {LANTERNS.map((p, i) => (
        <Lantern key={i} position={p} />
      ))}
      <Mailbox />

      <Bushes
        spots={[
          [-3.6, 0, 3.2, 0.9],
          [-5.6, 0, 2.8, 1.0],
          [-7.4, 0, 1.5, 1.2],
          [3.6, 0, 2.8, 1.0],
          [4.6, 0, 1.0, 1.2],
          [-4.2, 0, 8.2, 1.0],
          [3.8, 0, 8.4, 0.9],
          [-8.2, 0, 6.0, 1.3],
          [7.4, 0, 5.6, 1.2],
          [-6.5, 0, 12.6, 0.9],
          [5.2, 0, 12.9, 1.0],
        ]}
      />
      <Flowers
        patches={[
          { x: -4.8, z: 4.4, w: 3.0, d: 1.4, n: hi ? 180 : 90, colors: ['#ffffff', '#f6f3e8', '#a9c8f0'] },
          { x: -6.2, z: 3.6, w: 1.6, d: 1.2, n: hi ? 90 : 45, colors: ['#6f8ee8', '#8aa6f0', '#5c7cd8'], size: 1.4 },
          { x: 2.2, z: 4.0, w: 2.2, d: 1.2, n: hi ? 140 : 70, colors: ['#ef7fa5', '#f4a6c1', '#ffffff', '#f2d16b'] },
          { x: -2.7, z: 7.2, w: 2.2, d: 1.4, n: hi ? 140 : 70, colors: ['#ffffff', '#f2d16b', '#ef7fa5'] },
          { x: 2.0, z: 7.8, w: 2.4, d: 1.6, n: hi ? 140 : 70, colors: ['#b49ae6', '#ffffff', '#ef7fa5'] },
          { x: -3.2, z: 12.9, w: 2.4, d: 1.0, n: hi ? 120 : 60, colors: ['#ffffff', '#f6f3e8', '#f2d16b'] },
          { x: 2.6, z: 13.1, w: 2.4, d: 1.0, n: hi ? 120 : 60, colors: ['#ef7fa5', '#f4a6c1', '#ffffff'] },
          { x: 5.6, z: 6.8, w: 2.0, d: 2.0, n: hi ? 90 : 45, colors: ['#e86a4a', '#f2a25a', '#ffffff'] },
          { x: 0, z: -8, w: 44, d: 30, n: hi ? 420 : 160, colors: ['#ffffff', '#f2d16b', '#f4a6c1'], size: 0.8 },
        ]}
      />
      <Spires
        color="#4f62c9"
        spots={[
          [-3.4, 12.4],
          [-3.1, 12.6],
          [-3.7, 12.7],
          [-2.8, 12.3],
          [-4.0, 12.5],
          [-5.4, 4.0],
          [-5.0, 4.3],
          [-6.8, 3.0],
          [3.0, 3.4],
        ]}
      />
      <Grass count={hi ? 9000 : 2500} area={[-22, -14, 22, 22]} avoid={grassAvoid} />
    </group>
  );
}
