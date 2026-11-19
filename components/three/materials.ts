import * as THREE from 'three';

/** Shared uniforms updated once per frame. */
export const shared = {
  uTime: { value: 0 },
  uWind: { value: 1 },
};

/**
 * Adds a gentle wind sway to any standard material (works with InstancedMesh).
 * Vertices higher up (in local space) move more, so trunks stay planted.
 */
export function windify<T extends THREE.Material>(mat: T, strength = 0.06, height = 1, freq = 1): T {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = shared.uTime;
    shader.uniforms.uWind = shared.uWind;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uWind;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          #ifdef USE_INSTANCING
            wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          #endif
          float k = clamp(position.y / ${height.toFixed(3)}, 0.0, 1.0);
          float t = uTime * ${freq.toFixed(3)};
          float sway = sin(t * 1.3 + wp.x * 0.45 + wp.z * 0.3) * 0.6 + sin(t * 2.1 + wp.x * 1.3) * 0.25;
          transformed.x += sway * ${strength.toFixed(3)} * k * uWind;
          transformed.z += cos(t * 1.1 + wp.z * 0.5) * ${(strength * 0.6).toFixed(3)} * k * uWind;
        }`,
      );
  };
  mat.customProgramCacheKey = () => `wind-${strength}-${height}-${freq}`;
  return mat;
}

const cache = new Map<string, THREE.Material>();

/** Soft, slightly matte standard material — the "painted" look comes from lighting + palette. */
export function paint(color: string, opts: THREE.MeshStandardMaterialParameters = {}) {
  const key = color + JSON.stringify(opts, (k, v) => (v instanceof THREE.Texture ? v.uuid : v));
  let m = cache.get(key) as THREE.MeshStandardMaterial | undefined;
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...opts });
    cache.set(key, m);
  }
  return m;
}

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(...repeat);
  }
  return tex;
}

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
export const rand = rng(42);
export const seeded = rng;

let _tex: ReturnType<typeof makeTextures> | null = null;
export function textures() {
  if (!_tex) _tex = makeTextures();
  return _tex;
}

function makeTextures() {
  const r = rng(7);
  const planks = canvasTexture(
    512,
    512,
    (ctx) => {
      const rows = 8;
      for (let i = 0; i < rows; i++) {
        const l = 52 + r() * 10;
        ctx.fillStyle = `hsl(28, 42%, ${l}%)`;
        ctx.fillRect(0, (i * 512) / rows, 512, 512 / rows);
        ctx.fillStyle = 'rgba(70,40,20,0.35)';
        ctx.fillRect(0, (i * 512) / rows, 512, 3);
        const off = r() * 512;
        ctx.fillRect(off, (i * 512) / rows, 3, 512 / rows);
        for (let k = 0; k < 14; k++) {
          ctx.strokeStyle = `rgba(90,50,25,${0.06 + r() * 0.08})`;
          ctx.beginPath();
          const y = (i * 512) / rows + r() * (512 / rows);
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(170, y + r() * 6 - 3, 340, y + r() * 6 - 3, 512, y);
          ctx.stroke();
        }
      }
    },
    [3, 3],
  );

  const plaster = canvasTexture(
    512,
    512,
    (ctx) => {
      ctx.fillStyle = '#F7EFE2';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 6000; i++) {
        ctx.fillStyle = `rgba(${150 + r() * 60},${130 + r() * 50},${100 + r() * 40},${r() * 0.05})`;
        const s = 2 + r() * 14;
        ctx.beginPath();
        ctx.arc(r() * 512, r() * 512, s / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [4, 2],
  );

  const tiles = canvasTexture(
    256,
    256,
    (ctx) => {
      ctx.fillStyle = '#d9cbb3';
      ctx.fillRect(0, 0, 256, 256);
      const n = 8;
      for (let x = 0; x < n; x++)
        for (let y = 0; y < n; y++) {
          const blue = (x + y) % 3 === 0;
          ctx.fillStyle = blue ? `hsl(205, 40%, ${70 + r() * 8}%)` : `hsl(40, 45%, ${92 - r() * 5}%)`;
          ctx.fillRect(x * 32 + 1.5, y * 32 + 1.5, 29, 29);
        }
    },
    [6, 3],
  );

  const roof = canvasTexture(
    256,
    256,
    (ctx) => {
      ctx.fillStyle = '#7b6a62';
      ctx.fillRect(0, 0, 256, 256);
      const rows = 10;
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < 9; x++) {
          const off = y % 2 ? 14 : 0;
          ctx.fillStyle = `hsl(${12 + r() * 14}, ${18 + r() * 14}%, ${38 + r() * 12}%)`;
          ctx.beginPath();
          ctx.roundRect(x * 30 - off, y * 26, 28, 24, [0, 0, 8, 8]);
          ctx.fill();
        }
    },
    [2, 2],
  );

  const rug = canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = '#B5543B';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#E9C98C';
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, 228, 228);
    ctx.strokeStyle = '#3E5C76';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 196, 196);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#E9C98C' : '#3E5C76';
      ctx.beginPath();
      const cx = 128;
      const cy = 128;
      const s = 70 - i * 11;
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s, cy);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx - s, cy);
      ctx.fill();
    }
  });

  return { planks, plaster, tiles, roof, rug };
}

/** Code-editor style screen for the laptop / monitor. */
export function screenTexture(variant: 'code' | 'terminal' = 'code') {
  const r = rng(variant === 'code' ? 3 : 9);
  return canvasTexture(512, 320, (ctx) => {
    ctx.fillStyle = variant === 'code' ? '#20242c' : '#16201a';
    ctx.fillRect(0, 0, 512, 320);
    ctx.fillStyle = '#2b303a';
    ctx.fillRect(0, 0, 512, 22);
    ['#ef6b5b', '#f2c14e', '#7cc47f'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(14 + i * 16, 11, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    const palette =
      variant === 'code' ? ['#e7b45a', '#8ec5e8', '#b9d68a', '#d79bd9', '#c9c3b6'] : ['#9fe2a2', '#9fe2a2', '#e7e7c7'];
    for (let line = 0; line < 13; line++) {
      let x = 20 + (line % 4) * 18 * (r() > 0.5 ? 1 : 0);
      const y = 40 + line * 21;
      const words = 2 + Math.floor(r() * 5);
      for (let w = 0; w < words; w++) {
        const len = 18 + r() * 70;
        ctx.fillStyle = palette[Math.floor(r() * palette.length)];
        ctx.globalAlpha = 0.9;
        ctx.fillRect(x, y, len, 8);
        x += len + 10;
      }
    }
    ctx.globalAlpha = 1;
  });
}

/** Painted sky gradient for interior windows. */
export function windowSky(top: string, bottom: string, sun?: string) {
  return canvasTexture(128, 256, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 256);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(20 + i * 22, 70 + (i % 2) * 14, 22, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (sun) {
      ctx.fillStyle = sun;
      ctx.beginPath();
      ctx.arc(92, 150, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5f8a4a';
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.quadraticCurveTo(40, 190, 80, 215);
    ctx.quadraticCurveTo(110, 200, 128, 210);
    ctx.lineTo(128, 256);
    ctx.fill();
  });
}

/** Radial soft sprite used for particles and steam. */
let _sprite: THREE.Texture | null = null;
export function softSprite() {
  if (_sprite) return _sprite;
  _sprite = canvasTexture(64, 64, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  });
  _sprite.colorSpace = THREE.NoColorSpace;
  return _sprite;
}
