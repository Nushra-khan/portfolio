'use client';

/**
 * Islamic decor for the cottage: Bismillah calligraphy, a prayer mat with tasbih,
 * a Quran on a wooden rehal, hanging fanoos lanterns, zellige tiles and a crescent moon.
 */

import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import { paint } from './materials';
import { geo } from './Nature';
import { glow } from './Cottage';

const BISMILLAH = 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext('2d')! };
}

function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Eight-pointed star (two overlapping squares), a classic Islamic geometric motif. */
function star8(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.62;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}

/* ------------------------------------------------------- calligraphy -- */

function drawBismillah(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // deep green ground
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1d4a37');
  g.addColorStop(1, '#163a2c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // gold double border with corner stars
  ctx.strokeStyle = '#d9b25a';
  ctx.lineWidth = 6;
  ctx.strokeRect(22, 22, w - 44, h - 44);
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, w - 72, h - 72);
  ctx.fillStyle = '#d9b25a';
  [
    [36, 36],
    [w - 36, 36],
    [36, h - 36],
    [w - 36, h - 36],
  ].forEach(([x, y]) => {
    star8(ctx, x, y, 16);
    ctx.fill();
  });
  // a soft row of small stars along the bottom
  ctx.globalAlpha = 0.35;
  for (let x = 110; x < w - 100; x += 64) {
    star8(ctx, x, h - 62, 7);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // calligraphy
  ctx.fillStyle = '#e9c46a';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 6;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  let size = 175;
  ctx.font = `700 ${size}px Amiri, "Traditional Arabic", "Arabic Typesetting", "Segoe UI", serif`;
  while (ctx.measureText(BISMILLAH).width > w - 150 && size > 40) {
    size -= 4;
    ctx.font = `700 ${size}px Amiri, "Traditional Arabic", "Arabic Typesetting", "Segoe UI", serif`;
  }
  ctx.fillText(BISMILLAH, w / 2, h / 2 - 8);
  ctx.shadowBlur = 0;
}

export function Calligraphy({ position, width = 1.5, bind }: { position: [number, number, number]; width?: number; bind?: object }) {
  const height = width * 0.42;
  const { tex, c, ctx } = useMemo(() => {
    const { c, ctx } = makeCanvas(1400, Math.round(1400 * 0.42));
    drawBismillah(ctx, c.width, c.height);
    return { tex: toTexture(c), c, ctx };
  }, []);
  // redraw once the bundled Amiri calligraphy font has loaded
  useEffect(() => {
    let alive = true;
    document.fonts?.load('700 80px Amiri', BISMILLAH).then(() => {
      if (!alive) return;
      drawBismillah(ctx, c.width, c.height);
      tex.needsUpdate = true;
    });
    return () => {
      alive = false;
    };
  }, [tex, c, ctx]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.1 }), [tex]);
  const frame = paint('#6b4428', { roughness: 0.6 });
  const trim = paint('#d9a441', { metalness: 0.7, roughness: 0.3 });
  return (
    <group position={position} {...bind}>
      <mesh geometry={geo.box} scale={[width + 0.14, height + 0.14, 0.06]} material={frame} castShadow />
      <mesh position={[0, 0, 0.032]} geometry={geo.box} scale={[width + 0.03, height + 0.03, 0.01]} material={trim} />
      <mesh position={[0, 0, 0.04]} material={mat}>
        <planeGeometry args={[width, height]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------ prayer mat -- */

function prayerMatTexture() {
  const { c, ctx } = makeCanvas(400, 680);
  const W = c.width;
  const H = c.height;
  ctx.fillStyle = '#7a1f2b';
  ctx.fillRect(0, 0, W, H);
  // patterned border
  ctx.fillStyle = '#1f4d3a';
  ctx.fillRect(14, 14, W - 28, H - 28);
  ctx.fillStyle = '#7a1f2b';
  ctx.fillRect(40, 40, W - 80, H - 80);
  ctx.fillStyle = '#d9b25a';
  for (let y = 30; y < H; y += 34) {
    star8(ctx, 27, y, 8);
    ctx.fill();
    star8(ctx, W - 27, y, 8);
    ctx.fill();
  }
  for (let x = 60; x < W - 40; x += 34) {
    star8(ctx, x, 27, 8);
    ctx.fill();
    star8(ctx, x, H - 27, 8);
    ctx.fill();
  }
  // mihrab arch
  ctx.strokeStyle = '#e9c46a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(80, H - 80);
  ctx.lineTo(80, 250);
  ctx.quadraticCurveTo(80, 120, W / 2, 80);
  ctx.quadraticCurveTo(W - 80, 120, W - 80, 250);
  ctx.lineTo(W - 80, H - 80);
  ctx.stroke();
  ctx.fillStyle = '#8f2a37';
  ctx.fill();
  ctx.strokeStyle = '#e9c46a';
  ctx.lineWidth = 2;
  ctx.stroke();
  // hanging lamp motif inside the arch
  ctx.fillStyle = '#e9c46a';
  ctx.fillRect(W / 2 - 1, 120, 2, 70);
  ctx.beginPath();
  ctx.moveTo(W / 2 - 22, 190);
  ctx.lineTo(W / 2 + 22, 190);
  ctx.lineTo(W / 2 + 12, 230);
  ctx.lineTo(W / 2 - 12, 230);
  ctx.closePath();
  ctx.fill();
  // field pattern
  ctx.globalAlpha = 0.5;
  for (let y = 300; y < H - 110; y += 52)
    for (let x = 120; x < W - 100; x += 52) {
      star8(ctx, x, y, 11);
      ctx.fill();
    }
  ctx.globalAlpha = 1;
  return toTexture(c);
}

export function PrayerMat({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: prayerMatTexture(), roughness: 1 }), []);
  const beads = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < 33; i++) {
      const a = (i / 33) * Math.PI * 2;
      out.push([Math.cos(a) * 0.075, 0.012, Math.sin(a) * 0.1]);
    }
    return out;
  }, []);
  const beadMat = paint('#2f6b55', { roughness: 0.25 });
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} material={mat} receiveShadow>
        <planeGeometry args={[0.72, 1.22]} />
      </mesh>
      {/* fringe */}
      {[-0.63, 0.63].map((z) => (
        <mesh key={z} position={[0, 0.006, z]} geometry={geo.box} scale={[0.7, 0.004, 0.05]} material={paint('#efe4cc')} />
      ))}
      {/* tasbih (33 prayer beads) */}
      <group position={[0.2, 0.012, 0.4]} rotation={[0, 0.5, 0]}>
        {beads.map((p, i) => (
          <mesh key={i} position={p} material={beadMat}>
            <sphereGeometry args={[0.011, 8, 6]} />
          </mesh>
        ))}
        <mesh position={[0.11, 0.01, 0]} material={beadMat}>
          <sphereGeometry args={[0.016, 10, 8]} />
        </mesh>
        <mesh position={[0.15, 0.006, 0]} rotation={[0, 0, Math.PI / 2]} geometry={geo.cyl} scale={[0.012, 0.06, 0.012]} material={paint('#d9b25a')} />
      </group>
    </group>
  );
}

/* --------------------------------------------------- Quran on rehal -- */

export function QuranStand({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const wood = paint('#8a5a34', { roughness: 0.55 });
  const cover = paint('#1f4d3a', { roughness: 0.45 });
  const gold = paint('#d9a441', { metalness: 0.7, roughness: 0.3 });
  const page = paint('#f6eed8', { roughness: 0.9 });
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* low side table */}
      <mesh position={[0, 0.55, 0]} geometry={geo.cyl} scale={[0.36, 0.05, 0.36]} material={paint('#6b4428', { roughness: 0.6 })} castShadow receiveShadow />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return <mesh key={i} position={[Math.cos(a) * 0.24, 0.27, Math.sin(a) * 0.24]} geometry={geo.box} scale={[0.04, 0.54, 0.04]} material={paint('#5e3d24')} castShadow />;
      })}
      {/* rehal: two carved boards crossed in an X */}
      <group position={[0, 0.58, 0]}>
        {[-1, 1].map((s) => (
          <group key={s} rotation={[s * 0.55, 0, 0]}>
            <mesh position={[0, 0.1, 0]} geometry={geo.box} scale={[0.34, 0.22, 0.018]} material={wood} castShadow />
            <mesh position={[0, 0.12, s * 0.01]} geometry={geo.box} scale={[0.2, 0.06, 0.004]} material={paint('#6b4428')} />
          </group>
        ))}
        {/* open Quran resting in the V */}
        <group position={[0, 0.2, 0]}>
          {[-1, 1].map((s) => (
            <group key={s} rotation={[0, 0, 0]} position={[0, 0, 0]}>
              <mesh position={[0, 0.0, s * 0.06]} rotation={[s * -0.95, 0, 0]} geometry={geo.box} scale={[0.26, 0.012, 0.14]} material={cover} castShadow />
              <mesh position={[0, 0.012, s * 0.058]} rotation={[s * -0.95, 0, 0]} geometry={geo.box} scale={[0.24, 0.016, 0.13]} material={page} />
            </group>
          ))}
          <mesh position={[0.11, -0.04, 0.0]} geometry={geo.box} scale={[0.008, 0.08, 0.008]} material={paint('#2f6b55')} />
          <mesh position={[0, -0.02, 0.0]} geometry={geo.box} scale={[0.26, 0.01, 0.01]} material={gold} />
        </group>
      </group>
    </group>
  );
}

/* --------------------------------------------------------- fanoos -- */

export function Fanoos({ position, chain = 0.3, scale = 1 }: { position: [number, number, number]; chain?: number; scale?: number }) {
  const brass = paint('#b8862f', { metalness: 0.75, roughness: 0.32 });
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, -chain / 2, 0]} geometry={geo.cyl} scale={[0.008, chain, 0.008]} material={paint('#3d3a35', { metalness: 0.5 })} />
      <group position={[0, -chain, 0]}>
        <mesh position={[0, -0.02, 0]} material={brass}>
          <sphereGeometry args={[0.02, 8, 6]} />
        </mesh>
        <mesh position={[0, -0.08, 0]} material={brass} castShadow>
          <coneGeometry args={[0.1, 0.1, 6]} />
        </mesh>
        <mesh position={[0, -0.13, 0]} material={brass}>
          <cylinderGeometry args={[0.105, 0.105, 0.02, 6]} />
        </mesh>
        <mesh position={[0, -0.25, 0]} material={glow.lantern}>
          <cylinderGeometry args={[0.085, 0.07, 0.22, 6]} />
        </mesh>
        {/* brass ribs */}
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return <mesh key={i} position={[Math.cos(a) * 0.088, -0.25, Math.sin(a) * 0.088]} geometry={geo.box} scale={[0.012, 0.23, 0.012]} material={brass} />;
        })}
        <mesh position={[0, -0.37, 0]} material={brass}>
          <cylinderGeometry args={[0.07, 0.04, 0.03, 6]} />
        </mesh>
        <mesh position={[0, -0.41, 0]} material={brass}>
          <coneGeometry args={[0.03, 0.06, 6]} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------------------------------------------------- zellige tiles -- */

export function zelligeTexture() {
  const { c, ctx } = makeCanvas(512, 512);
  const n = 4;
  const s = c.width / n;
  ctx.fillStyle = '#f4efe3';
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i <= n; i++)
    for (let j = 0; j <= n; j++) {
      const x = i * s;
      const y = j * s;
      ctx.fillStyle = '#2f6f8f';
      star8(ctx, x, y, s * 0.36);
      ctx.fill();
      ctx.fillStyle = '#f4efe3';
      star8(ctx, x, y, s * 0.2);
      ctx.fill();
      ctx.fillStyle = '#c2683f';
      star8(ctx, x, y, s * 0.1);
      ctx.fill();
      // small cross between stars
      ctx.fillStyle = '#3f8f7a';
      const cx = x + s / 2;
      const cy = y + s / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-s * 0.12, -s * 0.04, s * 0.24, s * 0.08);
      ctx.fillRect(-s * 0.04, -s * 0.12, s * 0.08, s * 0.24);
      ctx.restore();
    }
  // grout lines
  ctx.strokeStyle = 'rgba(120,110,95,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= n * 2; i++) {
    ctx.beginPath();
    ctx.moveTo((i * s) / 2, 0);
    ctx.lineTo((i * s) / 2, c.height);
    ctx.moveTo(0, (i * s) / 2);
    ctx.lineTo(c.width, (i * s) / 2);
    ctx.stroke();
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 1.1);
  return t;
}

/* -------------------------------------------------- crescent moon -- */

export function crescentTexture() {
  const { c, ctx } = makeCanvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 60, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,240,200,0.25)');
  g.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#fbf3d9';
  ctx.beginPath();
  ctx.arc(128, 128, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(158, 112, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  // small star beside the crescent
  ctx.fillStyle = '#fbf3d9';
  star8(ctx, 196, 92, 10);
  ctx.fill();
  return toTexture(c);
}
