'use client';

/**
 * The workshop's apothecary shelf: one labelled glass jar per skill, grouped and
 * colour-coded by category. Drawn with a handful of draw calls (instanced jars,
 * a single merged mesh for all the paper labels) so it stays light on phones.
 */

import * as THREE from 'three';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { paint } from './materials';
import { geo } from './Nature';
import { setUI, getUI } from '@/lib/store';
import { skillGroups, skillShelves, skillId } from '@/content/site';

const SHELF_Y = [3.6, 3.05, 2.5, 1.95];
const PITCH = 0.44; // jar spacing
const GROUP_GAP = 0.34;
const R = 0.15; // jar radius
const LABEL_W = 0.25;
const LABEL_H = 0.15;

type Jar = { name: string; id: string; group: (typeof skillGroups)[number]; x: number; y: number; fill: number; tilt: number };
type Sign = { title: string; x: number; y: number; w: number };

function layout() {
  const jars: Jar[] = [];
  const signs: Sign[] = [];
  skillShelves.forEach((row, ri) => {
    const groups = row.map((id) => skillGroups.find((g) => g.id === id)!).filter(Boolean);
    const count = groups.reduce((n, g) => n + g.skills.length, 0);
    const width = count * PITCH + (groups.length - 1) * GROUP_GAP;
    let x = -width / 2 + PITCH / 2;
    const y = SHELF_Y[ri] + 0.02;
    groups.forEach((g) => {
      const start = x;
      g.skills.forEach((name, k) => {
        const h = Math.sin((ri * 31 + k * 7 + name.length) * 12.9898) * 43758.5453;
        const rnd = h - Math.floor(h);
        jars.push({ name, id: skillId(name), group: g, x, y, fill: 0.55 + rnd * 0.33, tilt: (rnd - 0.5) * 0.5 });
        x += PITCH;
      });
      const end = x - PITCH;
      signs.push({ title: g.title, x: (start + end) / 2, y: SHELF_Y[ri], w: Math.min(1.5, Math.max(0.9, end - start + 0.3)) });
      x += GROUP_GAP;
    });
  });
  return { jars, signs };
}

/* ----------------------------------------------------------- geometry -- */

const jarGeo = new THREE.LatheGeometry(
  [
    [0.0, 0.0],
    [R * 0.92, 0.0],
    [R, 0.02],
    [R, 0.27],
    [R * 0.92, 0.31],
    [R * 0.7, 0.335],
    [R * 0.66, 0.36],
    [R * 0.7, 0.37],
  ].map(([x, y]) => new THREE.Vector2(x, y)),
  28,
);
const fillGeo = (() => {
  const g = new THREE.CylinderGeometry(R * 0.86, R * 0.86, 1, 22);
  g.translate(0, 0.5, 0);
  return g;
})();
const lidGeo = new THREE.CylinderGeometry(R * 0.74, R * 0.68, 0.055, 22);
const knobGeo = new THREE.SphereGeometry(0.03, 12, 8);

const glassMat = new THREE.MeshStandardMaterial({
  color: '#f4fbf8',
  roughness: 0.05,
  metalness: 0.0,
  transparent: true,
  opacity: 0.18,
  depthWrite: false,
});
const fillMat = new THREE.MeshStandardMaterial({ roughness: 0.45, emissive: '#ffffff', emissiveIntensity: 0.06 });
const lidMat = new THREE.MeshStandardMaterial({ roughness: 0.75 });

/* ------------------------------------------------------- label atlas -- */

const CELL_W = 256;
const CELL_H = 154;
const COLS = 8;
const ATLAS = 2048;

function drawLabels(ctx: CanvasRenderingContext2D, jars: Jar[]) {
  ctx.clearRect(0, 0, ATLAS, ATLAS);
  jars.forEach((j, i) => {
    const cx = (i % COLS) * CELL_W;
    const cy = Math.floor(i / COLS) * CELL_H;
    // kraft-paper tag with a coloured band
    ctx.fillStyle = '#f3e6c8';
    ctx.beginPath();
    ctx.roundRect(cx + 6, cy + 6, CELL_W - 12, CELL_H - 12, 14);
    ctx.fill();
    ctx.fillStyle = j.group.color;
    ctx.fillRect(cx + 6, cy + 6, CELL_W - 12, 16);
    ctx.strokeStyle = 'rgba(90,60,30,0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.roundRect(cx + 16, cy + 30, CELL_W - 32, CELL_H - 44, 8);
    ctx.stroke();
    ctx.setLineDash([]);
    // name — shrink to fit, wrap to two lines if needed
    ctx.fillStyle = '#3a2a1a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const maxW = CELL_W - 44;
    const words = j.name.split(' ');
    let size = 44;
    const font = (s: number) => `600 ${s}px "Fraunces Variable", Georgia, serif`;
    ctx.font = font(size);
    let lines = [j.name];
    if (ctx.measureText(j.name).width > maxW && words.length > 1) {
      const mid = Math.ceil(words.length / 2);
      lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
      size = 36;
      ctx.font = font(size);
    }
    while (lines.some((l) => ctx.measureText(l).width > maxW) && size > 18) {
      size -= 2;
      ctx.font = font(size);
    }
    const mid = cy + 30 + (CELL_H - 44) / 2;
    if (lines.length === 1) ctx.fillText(lines[0], cx + CELL_W / 2, mid + 2);
    else {
      ctx.fillText(lines[0], cx + CELL_W / 2, mid - size * 0.55);
      ctx.fillText(lines[1], cx + CELL_W / 2, mid + size * 0.6);
    }
  });
}

function drawSign(title: string, w: number) {
  const c = document.createElement('canvas');
  c.width = Math.round(512 * (w / 1.2));
  c.height = 96;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#5b3a22';
  ctx.beginPath();
  ctx.roundRect(0, 0, c.width, c.height, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(231,180,90,0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(8, 8, c.width - 16, c.height - 16, 12);
  ctx.stroke();
  ctx.fillStyle = '#f3e6c8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 40px "Inter Variable", system-ui, sans-serif';
  const text = title.toUpperCase().split('').join(String.fromCharCode(8202));
  let size = 40;
  while (ctx.measureText(text).width > c.width - 40 && size > 20) {
    size -= 2;
    ctx.font = `600 ${size}px "Inter Variable", system-ui, sans-serif`;
  }
  ctx.fillText(text, c.width / 2, c.height / 2 + 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ---------------------------------------------------------- component -- */

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

export function SkillJars({ position }: { position: [number, number, number] }) {
  const { jars, signs } = useMemo(layout, []);
  const glass = useRef<THREE.InstancedMesh>(null);
  const fills = useRef<THREE.InstancedMesh>(null);
  const lids = useRef<THREE.InstancedMesh>(null);
  const knobs = useRef<THREE.InstancedMesh>(null);
  const halo = useRef<THREE.Group>(null);
  const lastHover = useRef<number>(-1);

  // label atlas (one texture, one merged mesh)
  const { labelGeo, labelMat, redraw } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = ATLAS;
    const ctx = canvas.getContext('2d')!;
    drawLabels(ctx, jars);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    jars.forEach((j, i) => {
      const x0 = j.x - LABEL_W / 2;
      const x1 = j.x + LABEL_W / 2;
      const y0 = j.y + 0.085;
      const y1 = y0 + LABEL_H;
      const z = R + 0.004;
      pos.push(x0, y0, z, x1, y0, z, x1, y1, z, x0, y1, z);
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      const u0 = (c * CELL_W) / ATLAS;
      const u1 = ((c + 1) * CELL_W) / ATLAS;
      const vt = 1 - (r * CELL_H) / ATLAS;
      const vb = 1 - ((r + 1) * CELL_H) / ATLAS;
      uv.push(u0, vb, u1, vb, u1, vt, u0, vt);
      const b = i * 4;
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, transparent: true, alphaTest: 0.5 });
    return {
      labelGeo: g,
      labelMat: mat,
      redraw: () => {
        drawLabels(ctx, jars);
        tex.needsUpdate = true;
      },
    };
  }, [jars]);

  // re-draw once the label fonts have loaded
  useEffect(() => {
    let alive = true;
    Promise.all([document.fonts?.load('600 40px "Fraunces Variable"'), document.fonts?.load('600 40px "Inter Variable"')]).then(() => alive && redraw());
    return () => {
      alive = false;
    };
  }, [redraw]);

  const signMats = useMemo(() => signs.map((s) => new THREE.MeshStandardMaterial({ map: drawSign(s.title, s.w), roughness: 0.7 })), [signs]);

  useLayoutEffect(() => {
    jars.forEach((j, i) => {
      _q.setFromEuler(_e.set(0, j.tilt, 0));
      _m.compose(_v.set(j.x, j.y, 0), _q, _s.set(1, 1, 1));
      glass.current!.setMatrixAt(i, _m);
      _m.compose(_v.set(j.x, j.y + 0.012, 0), _q, _s.set(1, 0.28 * j.fill, 1));
      fills.current!.setMatrixAt(i, _m);
      fills.current!.setColorAt(i, _c.set(j.group.color));
      _m.compose(_v.set(j.x, j.y + 0.395, 0), _q, _s.set(1, 1, 1));
      lids.current!.setMatrixAt(i, _m);
      lids.current!.setColorAt(i, _c.set('#b98a5a').lerp(new THREE.Color(j.group.color), 0.15));
      _m.compose(_v.set(j.x, j.y + 0.44, 0), _q, _s.set(1, 1, 1));
      knobs.current!.setMatrixAt(i, _m);
    });
    [glass, fills, lids, knobs].forEach((r) => {
      r.current!.instanceMatrix.needsUpdate = true;
      if (r.current!.instanceColor) r.current!.instanceColor.needsUpdate = true;
      r.current!.computeBoundingSphere();
    });
  }, [jars]);

  // highlight the hovered jar (from the 3D shelf or from the DOM skill chips)
  useFrame((state, dt) => {
    const hovered = getUI().hovered;
    const i = hovered?.startsWith('skill:') ? jars.findIndex((j) => j.id === hovered) : -1;
    const h = halo.current;
    if (h) {
      const k = 1 - Math.exp(-dt * 10);
      const target = i >= 0 ? 1 : 0;
      h.scale.setScalar(THREE.MathUtils.lerp(h.scale.x, target, k) || 0.0001);
      if (i >= 0) {
        h.position.set(jars[i].x, jars[i].y, 0);
        h.rotation.y = state.clock.elapsedTime * 0.8;
      }
    }
    if (i !== lastHover.current && fills.current) {
      if (lastHover.current >= 0) fills.current.setColorAt(lastHover.current, _c.set(jars[lastHover.current].group.color));
      if (i >= 0) fills.current.setColorAt(i, _c.set(jars[i].group.color).offsetHSL(0, 0.1, 0.18));
      if (fills.current.instanceColor) fills.current.instanceColor.needsUpdate = true;
      lastHover.current = i;
    }
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId === undefined) return;
    const id = jars[e.instanceId].id;
    if (getUI().hovered !== id) setUI({ hovered: id });
    document.body.style.cursor = 'pointer';
  };
  const onOut = () => {
    if (getUI().hovered?.startsWith('skill:')) setUI({ hovered: null });
    document.body.style.cursor = '';
  };

  const n = jars.length;
  const wood = paint('#6b4428', { roughness: 0.6 });
  const back = paint('#8a6440', { roughness: 0.85 });

  return (
    <group position={position}>
      {/* cabinet: dark backing, shelves, posts */}
      <mesh position={[0, 2.95, -0.2]} geometry={geo.box} scale={[8.5, 2.4, 0.04]} material={back} receiveShadow />
      {SHELF_Y.map((y) => (
        <mesh key={y} position={[0, y, 0]} geometry={geo.box} scale={[8.5, 0.04, 0.42]} material={wood} castShadow receiveShadow />
      ))}
      <mesh position={[0, 4.12, 0]} geometry={geo.box} scale={[8.7, 0.08, 0.46]} material={wood} castShadow />
      {[-4.25, 4.25].map((x) => (
        <mesh key={x} position={[x, 2.95, 0]} geometry={geo.box} scale={[0.06, 2.42, 0.42]} material={wood} castShadow />
      ))}

      {/* jars */}
      <instancedMesh ref={fills} args={[fillGeo, fillMat, n]} castShadow frustumCulled={false} />
      <instancedMesh ref={lids} args={[lidGeo, lidMat, n]} castShadow frustumCulled={false} />
      <instancedMesh ref={knobs} args={[knobGeo, lidMat, n]} frustumCulled={false} />
      <mesh geometry={labelGeo} material={labelMat} />
      <instancedMesh ref={glass} args={[jarGeo, glassMat, n]} onPointerMove={onMove} onPointerOut={onOut} frustumCulled={false} renderOrder={2} />

      {/* group signs hanging under each shelf */}
      {signs.map((s, i) => (
        <mesh key={s.title} position={[s.x, s.y - 0.075, 0.22]} material={signMats[i]}>
          <planeGeometry args={[s.w, 0.105]} />
        </mesh>
      ))}

      {/* glow ring for the hovered jar */}
      <group ref={halo} scale={0.0001}>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[R * 1.1, R * 1.45, 32]} />
          <meshBasicMaterial color="#ffd27a" transparent opacity={0.85} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
