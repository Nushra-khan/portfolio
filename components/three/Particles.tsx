'use client';

import * as THREE from 'three';
import { useMemo } from 'react';
import { shared, softSprite, seeded } from './materials';

/** Rising, curling steam — fully GPU-animated, no per-frame JS. */
export function Steam({
  position,
  count = 18,
  height = 0.9,
  spread = 0.12,
  size = 60,
  opacity = 0.32,
}: {
  position: [number, number, number];
  count?: number;
  height?: number;
  spread?: number;
  size?: number;
  opacity?: number;
}) {
  const { geom, mat } = useMemo(() => {
    const r = seeded(Math.floor(position[0] * 97 + position[2] * 31) + 7);
    const seeds = new Float32Array(count);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) seeds[i] = r();
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, height / 2, 0), height + 1);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: shared.uTime, uMap: { value: softSprite() }, uH: { value: height }, uSpread: { value: spread }, uSize: { value: size }, uOpacity: { value: opacity } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime; uniform float uH; uniform float uSpread; uniform float uSize;
        varying float vA;
        void main() {
          float ph = fract(uTime * 0.18 + aSeed);
          vec3 p = vec3(
            sin(uTime * 0.9 + aSeed * 30.0 + ph * 4.0) * uSpread * (0.3 + ph),
            ph * uH,
            cos(uTime * 0.7 + aSeed * 17.0 + ph * 3.0) * uSpread * (0.3 + ph));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * (0.4 + ph * 1.2) / -mv.z;
          vA = sin(ph * 3.14159) * (1.0 - ph * 0.4);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap; uniform float uOpacity;
        varying float vA;
        void main() {
          float a = texture2D(uMap, gl_PointCoord).r;
          gl_FragColor = vec4(vec3(1.0, 0.98, 0.95), a * vA * uOpacity);
        }`,
    });
    return { geom, mat };
  }, [position, count, height, spread, size, opacity]);
  return <points geometry={geom} material={mat} position={position} frustumCulled={false} />;
}

export const floatUniforms = {
  uNight: { value: 0 },
};

/** Drifting pollen by day, blinking fireflies by night. */
export function FloatingMotes({
  center,
  extent,
  count = 220,
  warm = false,
}: {
  center: [number, number, number];
  extent: [number, number, number];
  count?: number;
  warm?: boolean;
}) {
  const { geom, mat } = useMemo(() => {
    const r = seeded(count + (warm ? 3 : 0) + Math.floor(center[1]));
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * extent[0];
      pos[i * 3 + 1] = r() * extent[1];
      pos[i * 3 + 2] = (r() - 0.5) * extent[2];
      seeds[i] = r();
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Math.max(...extent));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: shared.uTime, uMap: { value: softSprite() }, uNight: floatUniforms.uNight, uWarm: { value: warm ? 1 : 0 } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime; uniform float uNight;
        varying float vA; varying float vSeed;
        void main() {
          vec3 p = position;
          float t = uTime * (0.15 + aSeed * 0.2);
          p.x += sin(t + aSeed * 40.0) * 0.6;
          p.y += sin(t * 1.3 + aSeed * 20.0) * 0.35;
          p.z += cos(t * 0.9 + aSeed * 10.0) * 0.6;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float blink = mix(1.0, smoothstep(0.2, 1.0, sin(uTime * (1.5 + aSeed * 2.0) + aSeed * 30.0)), uNight);
          gl_PointSize = mix(26.0, 70.0, uNight) * (0.5 + aSeed) / -mv.z;
          vA = blink;
          vSeed = aSeed;
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap; uniform float uNight; uniform float uWarm;
        varying float vA; varying float vSeed;
        void main() {
          float a = texture2D(uMap, gl_PointCoord).r;
          vec3 day = vec3(1.0, 0.97, 0.85);
          vec3 night = vec3(1.0, 0.85, 0.35);
          vec3 col = mix(day, night, max(uNight, uWarm));
          gl_FragColor = vec4(col, a * vA * mix(0.45, 0.95, uNight));
        }`,
    });
    return { geom, mat };
  }, [center, extent, count, warm]);
  return <points geometry={geom} material={mat} position={center} frustumCulled={false} />;
}
