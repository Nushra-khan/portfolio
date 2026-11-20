'use client';

/**
 * Work experience in the house:
 *  - a reading nook in the library with a FoundrFuse ID badge and an
 *    IIIT Kottayam research logbook (linked to the Experience panel), and
 *  - a phone on the workshop bench showing a mini FoundrFuse app screen,
 *    which opens the real Play Store listing.
 * All artwork is drawn in code — no company logos are reproduced.
 */

import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { paint, textures } from './materials';
import { geo } from './Nature';
import { setUI, useUI } from '@/lib/store';
import { experience, site } from '@/content/site';

const PLAY_URL = experience.find((e) => e.id === 'foundrfuse')?.link?.href;

function useHover(id: string, onClick?: () => void) {
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
      onClick: (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick?.();
      },
    },
  };
}

/** Eased lift + turn while hovered (frame-rate independent, so it stays smooth). */
function useLift(hover: boolean, lift = 0.04, turn = 0.25) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 6);
    g.position.y = THREE.MathUtils.lerp(g.position.y, hover ? lift : 0, k);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, hover ? turn : 0, k);
  });
  return ref;
}

function canvasTex(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const SERIF = '"Fraunces Variable", Georgia, serif';
const SANS = '"Inter Variable", system-ui, sans-serif';

/* ------------------------------------------------------------ ID badge -- */

function badgeTexture() {
  return canvasTex(300, 440, (ctx) => {
    ctx.fillStyle = '#fbf7ef';
    ctx.beginPath();
    ctx.roundRect(0, 0, 300, 440, 22);
    ctx.fill();
    ctx.fillStyle = '#2F4F7A';
    ctx.beginPath();
    ctx.roundRect(0, 0, 300, 120, [22, 22, 0, 0]);
    ctx.fill();
    // lanyard slot
    ctx.fillStyle = '#fbf7ef';
    ctx.beginPath();
    ctx.roundRect(120, 18, 60, 12, 6);
    ctx.fill();
    ctx.fillStyle = '#fbf7ef';
    ctx.textAlign = 'center';
    ctx.font = `700 34px ${SERIF}`;
    ctx.fillText('FoundrFuse', 150, 84);
    // avatar
    ctx.fillStyle = '#e7dcc6';
    ctx.beginPath();
    ctx.arc(150, 190, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9b48f';
    ctx.beginPath();
    ctx.arc(150, 176, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(150, 228, 34, 22, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#2b2a26';
    ctx.font = `600 34px ${SERIF}`;
    ctx.fillText(site.name, 150, 290);
    ctx.fillStyle = '#5b5a55';
    ctx.font = `600 20px ${SANS}`;
    ctx.fillText('MACHINE LEARNING', 150, 330);
    ctx.fillText('INTERN', 150, 356);
    ctx.fillStyle = '#2F4F7A';
    ctx.fillRect(40, 392, 220, 8);
  });
}

function IdBadge({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const { hover, bind } = useHover('exp:foundrfuse', () => PLAY_URL && window.open(PLAY_URL, '_blank', 'noopener'));
  const lift = useLift(hover, 0.05, -0.25);
  const face = useMemo(() => new THREE.MeshStandardMaterial({ map: badgeTexture(), roughness: 0.4 }), []);
  const strap = paint('#2F4F7A', { roughness: 0.8 });
  return (
    <group position={position} rotation={[0, rotation, 0]} {...bind}>
      <group ref={lift}>
        {/* small acrylic stand */}
        <mesh position={[0, 0.012, 0.02]} geometry={geo.box} scale={[0.16, 0.024, 0.08]} material={paint('#dfe8ea', { roughness: 0.1, transparent: true, opacity: 0.6 })} />
        <group position={[0, 0.13, 0]} rotation={[-0.18, 0, 0]}>
          <mesh geometry={geo.box} scale={[0.15, 0.22, 0.006]} material={paint('#fbf7ef')} castShadow />
          <mesh position={[0, 0, 0.0035]} material={face}>
            <planeGeometry args={[0.15, 0.22]} />
          </mesh>
          {/* lanyard draped behind */}
          <mesh position={[0, 0.16, -0.02]} rotation={[0.3, 0, 0]} geometry={geo.box} scale={[0.025, 0.14, 0.004]} material={strap} />
        </group>
        <mesh position={[0.1, 0.006, 0.05]} rotation={[0, 0.8, 0]} geometry={geo.box} scale={[0.025, 0.004, 0.22]} material={strap} />
      </group>
      <mesh visible={false} position={[0, 0.14, 0]}>
        <boxGeometry args={[0.26, 0.32, 0.2]} />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------- research logbook -- */

function logbookTexture() {
  return canvasTex(320, 420, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 320, 420);
    g.addColorStop(0, '#7a4a2a');
    g.addColorStop(1, '#5a341c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 320, 420);
    ctx.strokeStyle = '#d9b25a';
    ctx.lineWidth = 4;
    ctx.strokeRect(22, 22, 276, 376);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(32, 32, 256, 356);
    ctx.fillStyle = '#e9c46a';
    ctx.textAlign = 'center';
    ctx.font = `600 22px ${SANS}`;
    ctx.fillText('RESEARCH LOG', 160, 120);
    ctx.font = `700 38px ${SERIF}`;
    ctx.fillText('MINDS Lab', 160, 190);
    ctx.font = `500 22px ${SERIF}`;
    ctx.fillText('IIIT Kottayam', 160, 232);
    // small heart-pulse motif — healthcare research
    ctx.strokeStyle = '#e9c46a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, 300);
    ctx.lineTo(130, 300);
    ctx.lineTo(145, 270);
    ctx.lineTo(165, 330);
    ctx.lineTo(180, 300);
    ctx.lineTo(240, 300);
    ctx.stroke();
    ctx.font = `500 18px ${SANS}`;
    ctx.fillText('2026', 160, 360);
  });
}

function Logbook({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const { hover, bind } = useHover('exp:iiitk');
  const lift = useLift(hover, 0.04, 0.2);
  const cover = useMemo(() => new THREE.MeshStandardMaterial({ map: logbookTexture(), roughness: 0.65 }), []);
  const leather = paint('#5a341c', { roughness: 0.7 });
  return (
    <group position={position} rotation={[0, rotation, 0]} {...bind}>
      <group ref={lift}>
        <mesh position={[0, 0.022, 0]} geometry={geo.box} scale={[0.22, 0.04, 0.29]} material={leather} castShadow />
        <mesh position={[0.004, 0.022, 0]} geometry={geo.box} scale={[0.212, 0.032, 0.284]} material={paint('#f3e9d4')} />
        <mesh position={[0, 0.0425, 0]} rotation={[-Math.PI / 2, 0, 0]} material={cover}>
          <planeGeometry args={[0.22, 0.29]} />
        </mesh>
        {/* ribbon bookmark + elastic band */}
        <mesh position={[0.05, 0.004, 0.16]} rotation={[0.2, 0, 0]} geometry={geo.box} scale={[0.012, 0.004, 0.06]} material={paint('#8c3b3b')} />
        <mesh position={[0.085, 0.0225, 0]} geometry={geo.box} scale={[0.008, 0.044, 0.292]} material={paint('#2b2a26')} />
        {/* fountain pen */}
        <group position={[-0.16, 0.012, 0.02]} rotation={[0, 0.25, Math.PI / 2]}>
          <mesh geometry={geo.cyl} scale={[0.009, 0.16, 0.009]} material={paint('#1f4d3a', { roughness: 0.3 })} />
          <mesh position={[0, 0.09, 0]} material={paint('#d9a441', { metalness: 0.7, roughness: 0.3 })}>
            <coneGeometry args={[0.009, 0.025, 10]} />
          </mesh>
        </group>
      </group>
      <mesh visible={false} position={[0, 0.06, 0]}>
        <boxGeometry args={[0.36, 0.14, 0.36]} />
      </mesh>
    </group>
  );
}

/** Small writing desk against the library's side wall. */
export function ExperienceNook({ position }: { position: [number, number, number] }) {
  const wood = paint('#6b4428', { roughness: 0.55 });
  return (
    <group position={position}>
      {/* desk (long side along z, facing into the room) */}
      <mesh position={[0, 0.76, 0]} geometry={geo.box} scale={[0.7, 0.05, 1.4]} material={paint('#7a4f2e')} castShadow receiveShadow />
      {[
        [-0.3, -0.62],
        [0.3, -0.62],
        [-0.3, 0.62],
        [0.3, 0.62],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.37, z]} geometry={geo.box} scale={[0.05, 0.74, 0.05]} material={wood} castShadow />
      ))}
      <mesh position={[0.05, 0.62, 0]} geometry={geo.box} scale={[0.55, 0.14, 1.3]} material={wood} />
      {/* green-shaded banker's lamp */}
      <group position={[0.12, 0.785, -0.5]}>
        <mesh position={[0, 0.015, 0]} geometry={geo.cyl} scale={[0.08, 0.03, 0.08]} material={paint('#b8862f', { metalness: 0.7, roughness: 0.3 })} />
        <mesh position={[0, 0.16, 0]} geometry={geo.cyl} scale={[0.012, 0.28, 0.012]} material={paint('#b8862f', { metalness: 0.7, roughness: 0.3 })} />
        <mesh position={[-0.05, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} material={paint('#1f6b4f', { roughness: 0.25, side: THREE.DoubleSide })}>
          <cylinderGeometry args={[0.07, 0.07, 0.26, 18, 1, true, 0, Math.PI]} />
        </mesh>
        <mesh position={[-0.05, 0.285, 0]} rotation={[0, 0, Math.PI / 2]} material={paint('#fff1c9', { emissive: '#ffcf8a', emissiveIntensity: 2 })}>
          <cylinderGeometry args={[0.02, 0.02, 0.2, 10]} />
        </mesh>
      </group>
      <IdBadge position={[-0.05, 0.785, -0.12]} rotation={-Math.PI / 2 + 0.55} />
      <Logbook position={[-0.02, 0.785, 0.32]} rotation={-Math.PI / 2 + 0.35} />
      {/* rug + potted plant to make the corner cosy */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.7, 0.012, -0.1]} material={paint('#ffffff', { map: textures().rug, roughness: 1 })} receiveShadow>
        <planeGeometry args={[1.5, 2.1]} />
      </mesh>
      <group position={[0.1, 0, -1.05]}>
        <mesh position={[0, 0.2, 0]} material={paint('#c0703f')} castShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.4, 16]} />
        </mesh>
        {[
          [0, 0.75, 0, 0.28],
          [0.12, 0.62, 0.1, 0.2],
          [-0.12, 0.6, -0.08, 0.22],
          [0.05, 0.95, -0.05, 0.18],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} scale={r} material={paint(['#4f8a3a', '#6fae4c', '#5e9a42', '#7dbb55'][i])} castShadow>
            <icosahedronGeometry args={[1, 2]} />
          </mesh>
        ))}
      </group>
      {/* small stool */}
      <group position={[-0.65, 0, 0.1]}>
        <mesh position={[0, 0.46, 0]} geometry={geo.cyl} scale={[0.2, 0.05, 0.2]} material={paint('#8c3b3b', { roughness: 0.9 })} castShadow />
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(i * 2.1) * 0.12, 0.22, Math.sin(i * 2.1) * 0.12]} geometry={geo.cyl} scale={[0.018, 0.45, 0.018]} material={wood} />
        ))}
      </group>
      {/* framed photo above the desk */}
      <group position={[0.34, 1.75, -0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh geometry={geo.box} scale={[0.7, 0.5, 0.03]} material={paint('#5e3d24')} />
        <mesh position={[0, 0, 0.02]} material={paint('#a9c8f0')}>
          <planeGeometry args={[0.6, 0.4]} />
        </mesh>
        <mesh position={[0, -0.08, 0.021]} material={paint('#5f8a4a')}>
          <planeGeometry args={[0.6, 0.24]} />
        </mesh>
      </group>
    </group>
  );
}

/* --------------------------------------------------- FoundrFuse phone -- */

function appScreenTexture() {
  return canvasTex(360, 740, (ctx) => {
    const W = 360;
    // background
    ctx.fillStyle = '#f5f7fb';
    ctx.fillRect(0, 0, W, 740);
    // status bar + header
    const g = ctx.createLinearGradient(0, 0, W, 170);
    g.addColorStop(0, '#2F4F7A');
    g.addColorStop(1, '#4b6fa5');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, 170);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = `600 16px ${SANS}`;
    ctx.fillText('9:41', 20, 28);
    ctx.fillRect(W - 54, 18, 34, 12);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 34px ${SERIF}`;
    ctx.fillText('FoundrFuse', 22, 92);
    ctx.font = `500 17px ${SANS}`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText('Matches picked for you', 22, 128);
    // match cards
    const cards: [string, string, string, number][] = [
      ['Seed-stage HealthTech', 'Angel network · Pune', '#E7B45A', 94],
      ['AgriTech marketplace', 'Pre-seed fund · Delhi', '#7FA35B', 88],
      ['EdTech for schools', 'Impact investor · BLR', '#C2683F', 81],
    ];
    cards.forEach(([title, sub, color, score], i) => {
      const y = 196 + i * 148;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(30,40,70,0.12)';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(18, y, W - 36, 128, 18);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(62, y + 46, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1f2433';
      ctx.font = `700 19px ${SANS}`;
      ctx.fillText(title, 100, y + 42);
      ctx.fillStyle = '#6b7185';
      ctx.font = `500 15px ${SANS}`;
      ctx.fillText(sub, 100, y + 66);
      // match bar
      ctx.fillStyle = '#e6eaf2';
      ctx.beginPath();
      ctx.roundRect(38, y + 92, W - 140, 10, 5);
      ctx.fill();
      ctx.fillStyle = '#2F4F7A';
      ctx.beginPath();
      ctx.roundRect(38, y + 92, ((W - 140) * score) / 100, 10, 5);
      ctx.fill();
      ctx.fillStyle = '#2F4F7A';
      ctx.font = `700 16px ${SANS}`;
      ctx.fillText(`${score}%`, W - 92, y + 102);
    });
    // bottom nav
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 660, W, 80);
    ['#2F4F7A', '#b7bfd0', '#b7bfd0', '#b7bfd0'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.roundRect(38 + i * 82, 684, 34, 26, 8);
      ctx.fill();
    });
  });
}

export function AppPhone({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const { hover, bind } = useHover('phone', () => PLAY_URL && window.open(PLAY_URL, '_blank', 'noopener'));
  const lift = useLift(hover, 0.06, 0.3);
  const screen = useMemo(() => {
    const t = appScreenTexture();
    return new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.55, roughness: 0.3 });
  }, []);
  const glow = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    const k = 1 - Math.exp(-dt * 6);
    screen.emissiveIntensity = THREE.MathUtils.lerp(screen.emissiveIntensity, hover ? 1.0 : 0.55, k);
    // a soft "notification" pulse so the eye finds it
    if (glow.current) {
      const m = glow.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.18 + 0.12 * Math.sin(state.clock.elapsedTime * 1.6);
    }
  });
  const body = paint('#1f2229', { roughness: 0.35, metalness: 0.3 });
  const W = 0.2;
  const H = 0.41;
  return (
    <group position={position} rotation={[0, rotation, 0]} {...bind}>
      <group ref={lift}>
        {/* wooden phone stand */}
        <mesh position={[0, 0.02, 0.02]} geometry={geo.box} scale={[0.24, 0.04, 0.18]} material={paint('#a36a3c')} castShadow />
        <mesh position={[0, 0.07, -0.05]} rotation={[-0.3, 0, 0]} geometry={geo.box} scale={[0.22, 0.12, 0.03]} material={paint('#8a5a34')} />
        <group position={[0, 0.04 + H / 2, 0.0]} rotation={[-0.28, 0, 0]}>
          <mesh geometry={geo.box} scale={[W, H, 0.018]} material={body} castShadow />
          <mesh position={[0, 0, 0.0095]} material={screen}>
            <planeGeometry args={[W - 0.016, H - 0.02]} />
          </mesh>
          <mesh ref={glow} position={[0, 0, -0.02]}>
            <planeGeometry args={[W + 0.18, H + 0.18]} />
            <meshBasicMaterial color="#9cc3ff" transparent opacity={0.2} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <mesh visible={false} position={[0, 0.25, 0]}>
        <boxGeometry args={[0.32, 0.55, 0.3]} />
      </mesh>
    </group>
  );
}
