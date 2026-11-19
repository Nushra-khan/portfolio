'use client';

import * as THREE from 'three';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import { World } from './World';
import { setUI } from '@/lib/store';

function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    if (++frames.current > 6) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

export default function Scene({ tier, onReady }: { tier: 'high' | 'low'; onReady: () => void }) {
  const [dpr, setDpr] = useState<[number, number]>(tier === 'high' ? [1, 2] : [0.85, 1.5]);
  const declines = useRef(0);

  useEffect(() => {
    // safety: never leave the curtain up
    const t = setTimeout(onReady, 6000);
    return () => clearTimeout(t);
  }, [onReady]);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <Canvas
        shadows={tier === 'high' ? { type: THREE.PCFShadowMap } : false}
        dpr={dpr}
        gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: 42, near: 0.05, far: 400, position: [-3.2, 2.5, 19.5] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <PerformanceMonitor
          onDecline={() => {
            declines.current++;
            setDpr(([lo, hi]) => [Math.max(0.6, lo - 0.15), Math.max(0.8, hi - 0.35)]);
            if (declines.current >= 3 && tier === 'high') setUI({ tier: 'low' });
          }}
        />
        <AdaptiveDpr pixelated={false} />
        <Suspense fallback={null}>
          <World tier={tier} />
          <ReadySignal onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
