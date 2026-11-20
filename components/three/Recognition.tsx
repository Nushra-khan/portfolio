'use client';

/**
 * The study's recognition shelf: a "Best Website" trophy and a small plaque for
 * each leadership role. Every piece is hoverable and linked to the About panel.
 */

import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { paint } from './materials';
import { geo } from './Nature';
import { setUI, useUI } from '@/lib/store';
import { leadership, type Role } from '@/content/site';

function useHover(id: string) {
  const hover = useUI((s) => s.hovered === id);
  return {
    hover,
    bind: {
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setUI({ hovered: id });
        document.body.style.cursor = 'pointer';
      },
      onPointerOut: () => {
        setUI({ hovered: null });
        document.body.style.cursor = '';
      },
      onClick: (e: ThreeEvent<MouseEvent>) => e.stopPropagation(),
    },
  };
}

/** Lifts / glows a group while hovered. */
function useLift(hover: boolean, amount = 0.04) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 7);
    g.position.y = THREE.MathUtils.lerp(g.position.y, hover ? amount : 0, k);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, hover ? 0.35 : 0, k);
  });
  return ref;
}

/* ---------------------------------------------------------------- trophy -- */

const cupGeo = new THREE.LatheGeometry(
  [
    [0.0, 0.0],
    [0.04, 0.0],
    [0.035, 0.02],
    [0.018, 0.05],
    [0.016, 0.1],
    [0.03, 0.12],
    [0.075, 0.15],
    [0.1, 0.22],
    [0.11, 0.3],
    [0.105, 0.3],
    [0.0, 0.29],
  ].map(([x, y]) => new THREE.Vector2(x, y)),
  32,
);

export function Trophy({ position }: { position: [number, number, number] }) {
  const { hover, bind } = useHover('best-website');
  const lift = useLift(hover, 0.05);
  const gold = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#e8b74a', metalness: 0.9, roughness: 0.22, emissive: '#6b4a10', emissiveIntensity: 0.12 }),
    [],
  );
  useFrame((_, dt) => {
    gold.emissiveIntensity = THREE.MathUtils.lerp(gold.emissiveIntensity, hover ? 0.55 : 0.12, 1 - Math.exp(-dt * 6));
  });
  const plaque = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 96;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#d9a441';
    ctx.fillRect(0, 0, 256, 96);
    ctx.strokeStyle = '#8a6420';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 244, 84);
    ctx.fillStyle = '#3a2a10';
    ctx.textAlign = 'center';
    ctx.font = '700 30px Georgia, serif';
    ctx.fillText('BEST WEBSITE', 128, 46);
    ctx.font = '600 18px Georgia, serif';
    ctx.fillText('Workshop Winner', 128, 74);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return new THREE.MeshStandardMaterial({ map: t, metalness: 0.5, roughness: 0.4 });
  }, []);
  return (
    <group position={position} {...bind}>
      <group ref={lift}>
        {/* wooden base */}
        <mesh position={[0, 0.045, 0]} geometry={geo.box} scale={[0.22, 0.09, 0.16]} material={paint('#4a2f1c', { roughness: 0.45 })} castShadow />
        <mesh position={[0, 0.045, 0.081]} material={plaque}>
          <planeGeometry args={[0.18, 0.068]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} geometry={geo.box} scale={[0.14, 0.02, 0.1]} material={gold} />
        {/* cup */}
        <mesh position={[0, 0.11, 0]} geometry={cupGeo} material={gold} castShadow />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.11, 0.33, 0]} rotation={[0, 0, s * -0.2]} material={gold}>
            <torusGeometry args={[0.045, 0.01, 8, 20, Math.PI * 1.3]} />
          </mesh>
        ))}
        {/* star on the cup */}
        <mesh position={[0, 0.33, 0.1]} material={paint('#fff1c9', { emissive: '#e7b45a', emissiveIntensity: 0.6 })}>
          <circleGeometry args={[0.025, 5]} />
        </mesh>
      </group>
      <mesh visible={false} position={[0, 0.2, 0]}>
        <boxGeometry args={[0.32, 0.45, 0.25]} />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------------- role plaques -- */

function iconFor(id: Role['id'], ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = '#fbf5e9';
  ctx.fillStyle = '#fbf5e9';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (id === 'owasp') {
    // shield with a design pen — design lead for a security community
    ctx.beginPath();
    ctx.moveTo(0, -46);
    ctx.lineTo(38, -32);
    ctx.quadraticCurveTo(38, 22, 0, 48);
    ctx.quadraticCurveTo(-38, 22, -38, -32);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-12, 18);
    ctx.lineTo(14, -14);
    ctx.lineTo(20, -8);
    ctx.lineTo(-6, 24);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'google') {
    // megaphone — running campus workshops
    ctx.beginPath();
    ctx.moveTo(-34, -12);
    ctx.lineTo(-10, -12);
    ctx.lineTo(28, -36);
    ctx.lineTo(28, 36);
    ctx.lineTo(-10, 12);
    ctx.lineTo(-34, 12);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-22, 12);
    ctx.lineTo(-14, 38);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(30, 0, 22, -0.7, 0.7);
    ctx.stroke();
  } else {
    // leaf — environment club
    ctx.beginPath();
    ctx.moveTo(-30, 36);
    ctx.quadraticCurveTo(-36, -30, 36, -40);
    ctx.quadraticCurveTo(34, 30, -30, 36);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-30, 36);
    ctx.quadraticCurveTo(0, 0, 26, -28);
    ctx.stroke();
  }
  ctx.restore();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
}

function plaqueTexture(role: Role) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 340;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = role.color;
  ctx.fillRect(0, 0, 256, 340);
  ctx.strokeStyle = 'rgba(251,245,233,0.7)';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, 232, 316);
  iconFor(role.id, ctx, 128, 100);
  ctx.fillStyle = '#fbf5e9';
  ctx.textAlign = 'center';
  ctx.font = '700 25px Georgia, serif';
  wrap(ctx, role.title, 128, 198, 210, 28);
  ctx.globalAlpha = 0.75;
  ctx.font = '500 17px Georgia, serif';
  ctx.fillText(role.dates, 128, 310);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function RolePlaque({ role, position }: { role: Role; position: [number, number, number] }) {
  const { hover, bind } = useHover(`role:${role.id}`);
  const lift = useLift(hover, 0.04);
  const face = useMemo(() => new THREE.MeshStandardMaterial({ map: plaqueTexture(role), roughness: 0.6 }), [role]);
  const frame = paint('#d9a441', { metalness: 0.65, roughness: 0.3 });
  return (
    <group position={position} {...bind}>
      <group ref={lift}>
        {/* leaning slightly back on a little stand */}
        <group rotation={[-0.12, 0, 0]} position={[0, 0.17, 0]}>
          <mesh geometry={geo.box} scale={[0.25, 0.33, 0.025]} material={frame} castShadow />
          <mesh position={[0, 0, 0.014]} material={face}>
            <planeGeometry args={[0.226, 0.3]} />
          </mesh>
        </group>
        <mesh position={[0, 0.01, -0.02]} geometry={geo.box} scale={[0.2, 0.02, 0.08]} material={paint('#4a2f1c')} />
      </group>
      <mesh visible={false} position={[0, 0.18, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.2]} />
      </mesh>
    </group>
  );
}

/** Floating wall shelf with the trophy and one plaque per leadership role. */
export function RecognitionShelf({ position }: { position: [number, number, number] }) {
  const wood = paint('#7a4f2e', { roughness: 0.55 });
  return (
    <group position={position}>
      <mesh geometry={geo.box} scale={[1.5, 0.05, 0.3]} material={wood} castShadow receiveShadow />
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, -0.08, -0.08]} rotation={[0.6, 0, 0]} geometry={geo.box} scale={[0.04, 0.16, 0.04]} material={paint('#3d3a35', { metalness: 0.4 })} />
      ))}
      <group position={[0, 0.025, 0]}>
        <Trophy position={[-0.53, 0, 0.02]} />
        {leadership.map((r, i) => (
          <RolePlaque key={r.id} role={r} position={[-0.18 + i * 0.29, 0, 0.0]} />
        ))}
      </group>
    </group>
  );
}
