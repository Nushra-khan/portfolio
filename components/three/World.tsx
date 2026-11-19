'use client';

import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import type { DepthOfFieldEffect } from 'postprocessing';
import { world } from '@/lib/store';
import { cameraAt, flashAt, zoneAt, STATION_G, stationOf, INTERIOR_Y, ROOM_X } from '@/lib/journey';
import { shared } from './materials';
import { Exterior, skyUniforms, celestial, LANTERNS, MAILBOX } from './Exterior';
import { Interior } from './Interior';
import { glow } from './Cottage';
import { cloudMat } from './Nature';
import { floatUniforms, FloatingMotes } from './Particles';

const c = (hex: string) => new THREE.Color(hex);

/** Lighting moods. Interiors move from bright morning to dusky evening. */
const MOOD = {
  day: {
    hemiSky: c('#d6ebff'),
    hemiGround: c('#7d9a55'),
    hemi: 1.15,
    sun: c('#fff0d2'),
    sunI: 3.3,
    fog: c('#d7e9f0'),
  },
  rooms: [
    { hemiSky: c('#fff4e2'), hemiGround: c('#9c7c58'), hemi: 1.0, sun: c('#fff3dc'), sunI: 2.0, lamp: c('#ffd9a0'), lampI: 7 },
    { hemiSky: c('#fff1dc'), hemiGround: c('#9a7a56'), hemi: 0.95, sun: c('#ffefd2'), sunI: 1.9, lamp: c('#ffcf8a'), lampI: 9 },
    { hemiSky: c('#ffe6c4'), hemiGround: c('#8a6038'), hemi: 0.8, sun: c('#ffcf94'), sunI: 1.7, lamp: c('#ffbe6e'), lampI: 11 },
    { hemiSky: c('#ffe2c9'), hemiGround: c('#7d5a40'), hemi: 0.8, sun: c('#ffc49a'), sunI: 1.5, lamp: c('#ffbf7a'), lampI: 12 },
  ],
  night: {
    hemiSky: c('#6c7fb8'),
    hemiGround: c('#1f2c26'),
    hemi: 0.55,
    sun: c('#a9bcff'),
    sunI: 0.75,
    fog: c('#1d2846'),
  },
};

const SKY = {
  dayTop: c('#4f9fe0'),
  dayHorizon: c('#dcefF6'),
  nightTop: c('#0c1430'),
  nightHorizon: c('#34477a'),
};

export function World({ tier }: { tier: 'high' | 'low' }) {
  const { camera, scene, size } = useThree();
  const hi = tier === 'high';

  const exterior = useRef<THREE.Group>(null);
  const interior = useRef<THREE.Group>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const lampA = useRef<THREE.PointLight>(null);
  const lampB = useRef<THREE.PointLight>(null);
  const dof = useRef<DepthOfFieldEffect>(null);

  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      fwd: new THREE.Vector3(),
      color: new THREE.Color(),
      color2: new THREE.Color(),
      focus: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => {
    scene.fog = new THREE.Fog(MOOD.day.fog.clone(), 35, 170);
    scene.background = SKY.dayHorizon.clone();
  }, [scene]);

  const lastStation = useRef(-1);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    shared.uTime.value = state.clock.elapsedTime;
    shared.uWind.value = world.reduced ? 0 : 1;

    // --- journey parameter -------------------------------------------------
    if (world.reduced) {
      const st = stationOf(world.g);
      if (st !== lastStation.current) {
        lastStation.current = st;
        world.gSmooth = world.gMid = STATION_G[st];
        const el = document.getElementById('flash');
        if (el) {
          el.style.transition = 'none';
          el.style.opacity = '0.7';
          requestAnimationFrame(() => {
            el.style.transition = 'opacity 450ms ease';
            el.style.opacity = '0';
          });
        }
      }
    } else {
      // two-stage critically-damped follow: eases in *and* out, so the camera
      // never starts or stops abruptly however the wheel/trackpad behaves
      const k = 1 - Math.exp(-dt * 4.2);
      world.gMid += (world.g - world.gMid) * k;
      world.gSmooth += (world.gMid - world.gSmooth) * k;
      if (Math.abs(world.g - world.gSmooth) < 0.0002 && Math.abs(world.g - world.gMid) < 0.0002) world.gSmooth = world.gMid = world.g;
      const el = document.getElementById('flash');
      if (el) el.style.opacity = flashAt(world.gSmooth).toFixed(3);
    }
    const g = world.gSmooth;
    const { inside, night } = zoneAt(g);

    // --- camera --------------------------------------------------------------
    cameraAt(g, tmp.pos, tmp.look);
    // portrait screens: centre the cottage and lift it above the hero text
    const aspectNow = size.width / size.height;
    if (aspectNow < 0.9 && g < 0.6) {
      const w = 1 - THREE.MathUtils.smoothstep(g, 0.0, 0.5);
      tmp.look.x += 2.9 * w;
      tmp.look.y -= 1.6 * w;
      tmp.pos.z += 3 * w;
    }
    const px = world.reduced ? 0 : world.pointerSmooth.x;
    const py = world.reduced ? 0 : world.pointerSmooth.y;
    const kp = 1 - Math.exp(-dt * 2.5);
    world.pointerSmooth.x += (world.pointer.x - world.pointerSmooth.x) * kp;
    world.pointerSmooth.y += (world.pointer.y - world.pointerSmooth.y) * kp;
    tmp.fwd.subVectors(tmp.look, tmp.pos).normalize();
    tmp.right.crossVectors(tmp.fwd, tmp.up).normalize();
    const amp = inside ? 0.18 : 0.35;
    camera.position.copy(tmp.pos).addScaledVector(tmp.right, px * amp).addScaledVector(tmp.up, -py * amp * 0.5);
    camera.lookAt(tmp.look.x + px * amp * 0.25, tmp.look.y - py * amp * 0.15, tmp.look.z);
    const persp = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const fov = aspect < 0.8 ? 62 : aspect < 1.2 ? 52 : 42;
    if (persp.fov !== fov) {
      persp.fov = fov;
      persp.updateProjectionMatrix();
    }

    // --- what to draw -----------------------------------------------------
    if (exterior.current) exterior.current.visible = !inside;
    if (interior.current) interior.current.visible = inside;

    // --- lighting mood -----------------------------------------------------
    const H = hemi.current!;
    const S = sun.current!;
    const A = lampA.current!;
    const B = lampB.current!;
    const fog = scene.fog as THREE.Fog;

    if (!inside) {
      const n = night ? 1 : 0;
      const m = night ? MOOD.night : MOOD.day;
      H.color.copy(m.hemiSky);
      H.groundColor.copy(m.hemiGround);
      H.intensity = m.hemi;
      S.color.copy(m.sun);
      S.intensity = m.sunI;
      tmp.focus.set(night ? 2 : -1, 0, night ? 6 : 3);
      S.position.set(tmp.focus.x + (night ? 14 : 9), 22, tmp.focus.z + (night ? 4 : 14));
      S.target.position.copy(tmp.focus);
      fog.color.copy(m.fog);
      fog.near = night ? 20 : 35;
      fog.far = night ? 110 : 170;
      skyUniforms.uTop.value.copy(night ? SKY.nightTop : SKY.dayTop);
      skyUniforms.uHorizon.value.copy(night ? SKY.nightHorizon : SKY.dayHorizon);
      skyUniforms.uNight.value = n;
      floatUniforms.uNight.value = n;
      celestial.sun.opacity = 1 - n;
      celestial.moon.opacity = n;
      cloudMat.emissiveIntensity = night ? 0.08 : 0.55;
      cloudMat.color.set(night ? '#5d6a96' : '#ffffff');
      glow.window.emissiveIntensity = night ? 2.4 : 0.25;
      glow.lantern.emissiveIntensity = night ? 4 : 0.15;
      // lanterns near the mailbox carry real light at night
      A.position.set(LANTERNS[0][0], 1.25, LANTERNS[0][2]);
      A.color.set('#ffbf6e');
      A.intensity = night ? 6 : 0;
      A.distance = 9;
      B.position.set(MAILBOX[0] - 0.4, 1.9, MAILBOX[2] + 0.6);
      B.color.set('#ffd28a');
      B.intensity = night ? 3.5 : 0;
      B.distance = 6;
      (scene.background as THREE.Color).copy(night ? SKY.nightHorizon : SKY.dayHorizon);
    } else {
      const f = THREE.MathUtils.clamp(g - 1, 0, 3);
      const i0 = Math.floor(f);
      const i1 = Math.min(3, i0 + 1);
      const t = THREE.MathUtils.smoothstep(f - i0, 0.7, 1.0);
      const r0 = MOOD.rooms[i0];
      const r1 = MOOD.rooms[i1];
      H.color.copy(r0.hemiSky).lerp(r1.hemiSky, t);
      H.groundColor.copy(r0.hemiGround).lerp(r1.hemiGround, t);
      H.intensity = THREE.MathUtils.lerp(r0.hemi, r1.hemi, t);
      S.color.copy(r0.sun).lerp(r1.sun, t);
      S.intensity = THREE.MathUtils.lerp(r0.sunI, r1.sunI, t);
      const cx = THREE.MathUtils.lerp(ROOM_X[i0], ROOM_X[i1], t);
      tmp.focus.set(cx, INTERIOR_Y, -2);
      S.position.set(cx + 5, INTERIOR_Y + 9, 9);
      S.target.position.copy(tmp.focus);
      A.position.set(ROOM_X[i0] - 0.5, INTERIOR_Y + 3.2, -1.5);
      A.color.copy(r0.lamp);
      A.intensity = r0.lampI * (1 - t);
      A.distance = 14;
      B.position.set(ROOM_X[i1] - 0.5, INTERIOR_Y + 3.2, -1.5);
      B.color.copy(r1.lamp);
      B.intensity = i1 === i0 ? 0 : r1.lampI * t;
      B.distance = 14;
      fog.near = 60;
      fog.far = 200;
      floatUniforms.uNight.value = 0;
      (scene.background as THREE.Color).set('#2b2118');
    }
    S.target.updateMatrixWorld();

    if (dof.current) {
      // keep the hero subject crisp: the cottage by day, the mailbox at night
      if (!inside && !night) tmp.focus.set(-1.3, 2.6, 2.5);
      else if (night) tmp.focus.set(MAILBOX[0], 1.2, MAILBOX[2]);
      else tmp.focus.copy(tmp.look);
      dof.current.target = tmp.focus;
    }
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#d6ebff', '#7d9a55', 1.1]} />
      <directionalLight
        ref={sun}
        castShadow={hi}
        intensity={2.6}
        shadow-mapSize-width={hi ? 4096 : 1024}
        shadow-mapSize-height={hi ? 4096 : 1024}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <pointLight ref={lampA} intensity={0} distance={12} decay={1.6} />
      <pointLight ref={lampB} intensity={0} distance={12} decay={1.6} />

      <group ref={exterior}>
        <Exterior tier={tier} />
        <FloatingMotes center={[1, 0.3, 6]} extent={[18, 3.5, 14]} count={hi ? 220 : 90} />
      </group>
      <group ref={interior} visible={false}>
        <Interior />
      </group>

      {hi && (
        <EffectComposer multisampling={8}>
          <DepthOfField ref={dof} worldFocusRange={9} bokehScale={1.5} />
          <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.9} luminanceSmoothing={0.2} />
          <Vignette eskil={false} offset={0.25} darkness={0.45} />
        </EffectComposer>
      )}
    </>
  );
}
