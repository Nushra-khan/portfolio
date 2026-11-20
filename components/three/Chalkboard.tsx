'use client';

/**
 * The workshop chalkboard: every skill group hand-lettered in chalk, with
 * coloured chalk headings, little doodles, and a tray of chalk sticks.
 * One object, readable when the camera glides up to it.
 */

import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import { paint } from './materials';
import { geo } from './Nature';
import { skillGroups, site } from '@/content/site';

const BOARD_W = 7.4;
const BOARD_H = 2.45;
const TEX_W = 4096;
const TEX_H = Math.round((TEX_W * BOARD_H) / BOARD_W);

const HAND = '"Caveat Chalk", "Segoe Print", "Comic Sans MS", cursive';

/** Lighter "chalk" version of a group colour. */
function chalkColor(hex: string) {
  return new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), 0.38).getStyle();
}

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function wrapWords(ctx: CanvasRenderingContext2D, items: string[], maxW: number) {
  const lines: string[] = [];
  let line = '';
  items.forEach((it, i) => {
    const piece = (line ? '  ·  ' : '') + it;
    if (ctx.measureText(line + piece).width > maxW && line) {
      lines.push(line);
      line = it;
    } else line += piece;
    if (i === items.length - 1) lines.push(line);
  });
  return lines;
}

function squiggle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, r: () => number) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 1; i <= 12; i++) ctx.lineTo(x + (w * i) / 12, y + (r() - 0.5) * 7);
  ctx.stroke();
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? s * 0.45 : s;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawBoard(ctx: CanvasRenderingContext2D) {
  const r = rng(11);
  const W = TEX_W;
  const H = TEX_H;

  // slate with soft eraser smudges
  ctx.fillStyle = '#2c3a31';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) {
    const g = ctx.createRadialGradient(r() * W, r() * H, 0, r() * W, r() * H, 200 + r() * 420);
    g.addColorStop(0, `rgba(220,230,220,${0.03 + r() * 0.035})`);
    g.addColorStop(1, 'rgba(220,230,220,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.textBaseline = 'alphabetic';

  // header
  ctx.fillStyle = '#f4f1e6';
  ctx.font = `700 118px ${HAND}`;
  ctx.fillText(`${site.name}’s toolkit`, 120, 170);
  const tw = ctx.measureText(`${site.name}’s toolkit`).width;
  ctx.strokeStyle = 'rgba(244,241,230,0.85)';
  ctx.lineWidth = 7;
  squiggle(ctx, 120, 198, tw, r);
  ctx.font = `500 66px ${HAND}`;
  ctx.fillStyle = 'rgba(244,241,230,0.75)';
  ctx.fillText('~ always learning, always building ~', 150 + tw, 164);
  ctx.strokeStyle = '#ffd27a';
  ctx.lineWidth = 6;
  star(ctx, W - 230, 130, 48);
  star(ctx, W - 140, 205, 26);

  // 3 × 3 grid of skill groups
  const cols = 3;
  const top = 262;
  const padX = 120;
  const cellW = (W - padX * 2) / cols;
  const cellH = (H - top - 36) / 3;
  skillGroups.slice(0, 9).forEach((g, i) => {
    const cx = padX + (i % cols) * cellW;
    const cy = top + Math.floor(i / cols) * cellH;
    const col = chalkColor(g.color);
    // heading in coloured chalk, with a hand-drawn underline
    ctx.fillStyle = col;
    ctx.font = `700 76px ${HAND}`;
    ctx.fillText(g.title, cx, cy + 74);
    const hw = ctx.measureText(g.title).width;
    ctx.strokeStyle = col;
    ctx.lineWidth = 5;
    squiggle(ctx, cx, cy + 93, hw + 20, r);
    if (g.id === 'ai') {
      ctx.strokeStyle = '#ffd27a';
      ctx.lineWidth = 5;
      star(ctx, cx + hw + 64, cy + 46, 27);
    }
    // skills in white chalk
    ctx.fillStyle = '#f4f1e6';
    ctx.font = `500 56px ${HAND}`;
    const lines = wrapWords(ctx, g.skills, cellW - 80);
    lines.forEach((l, k) => ctx.fillText(l, cx + 6, cy + 152 + k * 58));
  });

  // chalk grain: knock tiny specks out of everything drawn
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 52000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.15 + r() * 0.35})`;
    ctx.fillRect(r() * W, r() * H, 1 + r() * 2.2, 1 + r() * 2.2);
  }
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = '#2c3a31';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}

export function Chalkboard({ position }: { position: [number, number, number] }) {
  const { tex, ctx } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = TEX_W;
    c.height = TEX_H;
    const ctx = c.getContext('2d')!;
    drawBoard(ctx);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    return { tex, ctx };
  }, []);

  // re-draw once the chalk handwriting font has loaded
  useEffect(() => {
    let alive = true;
    Promise.all([document.fonts?.load(`700 80px "Caveat Chalk"`), document.fonts?.load(`500 64px "Caveat Chalk"`)]).then(() => {
      if (!alive) return;
      drawBoard(ctx);
      tex.needsUpdate = true;
    });
    return () => {
      alive = false;
    };
  }, [tex, ctx]);

  const board = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, metalness: 0 }), [tex]);
  const frame = paint('#7a4f2e', { roughness: 0.55 });
  const chalk = ['#f4f1e6', '#f7c6d6', '#a9c8f0', '#ffd27a'];

  return (
    <group position={position}>
      {/* slate */}
      <mesh position={[0, 0, 0.02]} material={board} receiveShadow>
        <planeGeometry args={[BOARD_W, BOARD_H]} />
      </mesh>
      <mesh position={[0, 0, -0.01]} geometry={geo.box} scale={[BOARD_W, BOARD_H, 0.04]} material={paint('#2c3a31')} />
      {/* wooden frame */}
      {[
        [0, BOARD_H / 2 + 0.06, BOARD_W + 0.24, 0.12],
        [0, -BOARD_H / 2 - 0.06, BOARD_W + 0.24, 0.12],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.04]} geometry={geo.box} scale={[w, h, 0.08]} material={frame} castShadow />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * (BOARD_W + 0.12)) / 2, 0, 0.04]} geometry={geo.box} scale={[0.12, BOARD_H, 0.08]} material={frame} castShadow />
      ))}
      {/* chalk tray with chalk sticks and a felt eraser */}
      <group position={[0, -BOARD_H / 2 - 0.13, 0.12]}>
        <mesh geometry={geo.box} scale={[BOARD_W - 0.4, 0.04, 0.16]} material={frame} castShadow receiveShadow />
        <mesh position={[0, 0.03, 0.07]} geometry={geo.box} scale={[BOARD_W - 0.4, 0.03, 0.02]} material={frame} />
        {chalk.map((c, i) => (
          <mesh key={c} position={[-2.6 + i * 0.16, 0.035, -0.01]} rotation={[0, 0, Math.PI / 2 + (i - 1.5) * 0.12]} material={paint(c, { roughness: 1 })} castShadow>
            <cylinderGeometry args={[0.013, 0.013, 0.11, 8]} />
          </mesh>
        ))}
        <group position={[2.4, 0.045, 0]} rotation={[0, 0.15, 0]}>
          <mesh geometry={geo.box} scale={[0.26, 0.05, 0.09]} material={paint('#8a5a34')} castShadow />
          <mesh position={[0, -0.03, 0]} geometry={geo.box} scale={[0.26, 0.018, 0.09]} material={paint('#5b5a55', { roughness: 1 })} />
        </group>
      </group>
    </group>
  );
}
