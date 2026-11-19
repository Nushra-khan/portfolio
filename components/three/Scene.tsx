'use client';

import * as THREE from 'three';
import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import { World } from './World';
import { setUI, fallBackToStills } from '@/lib/store';

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    fallBackToStills(String((error as Error)?.message ?? error));
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Lifts the loading curtain once real frames are being drawn, and keeps watching:
 * if the GPU never draws anything (blocked WebGL, broken drivers, lost context)
 * the visitor gets the illustrated version instead of a blank page.
 */
function HealthCheck({ onReady }: { onReady: () => void }) {
  const { gl } = useThree();
  const frames = useRef(0);
  const drawn = useRef(0);
  const ready = useRef(false);
  const start = useRef(0);
  const settled = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      fallBackToStills('WebGL context lost');
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl]);

  useFrame(() => {
    if (settled.current) return;
    if (!start.current) start.current = performance.now();
    frames.current++;
    drawn.current += gl.info.render.triangles;
    if (!ready.current && frames.current > 6 && drawn.current > 0) {
      ready.current = true;
      onReady();
    }
    if (performance.now() - start.current > 7000) {
      settled.current = true;
      if (drawn.current === 0) fallBackToStills('nothing was rendered');
    }
  });
  return null;
}

export default function Scene({ tier, onReady }: { tier: 'high' | 'low'; onReady: () => void }) {
  const [dpr, setDpr] = useState<[number, number]>(tier === 'high' ? [1, 2] : [0.85, 1.5]);
  const declines = useRef(0);

  useEffect(() => {
    // safety: never leave the curtain up
    const t = setTimeout(onReady, 8000);
    return () => clearTimeout(t);
  }, [onReady]);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <SceneBoundary>
        <Canvas
          shadows={tier === 'high' ? { type: THREE.PCFShadowMap } : false}
          dpr={dpr}
          gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
          camera={{ fov: 42, near: 0.05, far: 400, position: [-3.2, 2.5, 19.5] }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
          fallback={null}
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
            <HealthCheck onReady={onReady} />
          </Suspense>
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
