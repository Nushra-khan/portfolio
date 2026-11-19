'use client';

import * as THREE from 'three';
import { useMemo } from 'react';
import { paint } from './materials';
import { geo } from './Nature';
import { Steam } from './Particles';

function lathe(points: [number, number][], segments = 28) {
  return new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  );
}

const bowlGeo = lathe([
  [0.0, 0.0],
  [0.1, 0.0],
  [0.12, 0.02],
  [0.22, 0.08],
  [0.27, 0.17],
  [0.28, 0.2],
  [0.26, 0.2],
  [0.25, 0.17],
  [0.2, 0.09],
  [0.0, 0.05],
]);

const plateGeo = lathe([
  [0, 0],
  [0.2, 0],
  [0.3, 0.02],
  [0.34, 0.035],
  [0.32, 0.04],
  [0.2, 0.015],
  [0, 0.015],
]);

export function Plate({ r = 1 }: { r?: number }) {
  return <mesh geometry={plateGeo} scale={[r, 1, r]} material={paint('#fbf7ef', { roughness: 0.35 })} castShadow receiveShadow />;
}

export function Ramen() {
  const noodles = useMemo(() => {
    const out: { p: [number, number, number]; r: number; rot: number }[] = [];
    for (let i = 0; i < 9; i++) out.push({ p: [Math.sin(i * 2.1) * 0.08, 0.175, Math.cos(i * 1.7) * 0.08], r: 0.05 + (i % 3) * 0.02, rot: i });
    return out;
  }, []);
  return (
    <group>
      <mesh geometry={bowlGeo} material={paint('#f3ece0', { roughness: 0.3 })} castShadow receiveShadow />
      <mesh position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]} material={paint('#d78e4a', { roughness: 0.25 })}>
        <torusGeometry args={[0.27, 0.008, 6, 40]} />
      </mesh>
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]} material={paint('#e2a35a', { roughness: 0.15 })}>
        <circleGeometry args={[0.245, 32]} />
      </mesh>
      {noodles.map((n, i) => (
        <mesh key={i} position={n.p} rotation={[-Math.PI / 2, 0, n.rot]} material={paint('#f2d27a')}>
          <torusGeometry args={[n.r, 0.008, 5, 18, Math.PI * 1.4]} />
        </mesh>
      ))}
      {/* jammy egg halves */}
      {[0, 1].map((i) => (
        <group key={i} position={[0.1 + i * 0.07, 0.185, -0.06 + i * 0.06]} rotation={[-Math.PI / 2 + 0.25, 0, i * 0.6]}>
          <mesh material={paint('#fffdf6')} scale={[1, 1.3, 0.55]}>
            <sphereGeometry args={[0.05, 14, 10]} />
          </mesh>
          <mesh position={[0, 0, 0.026]} material={paint('#f2a11c', { roughness: 0.3 })}>
            <circleGeometry args={[0.027, 16]} />
          </mesh>
        </group>
      ))}
      {/* grilled chicken strips */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.11 + i * 0.035, 0.19, 0.06 - i * 0.07]} rotation={[0, 0.4 + i * 0.3, 0]} geometry={geo.box} scale={[0.11, 0.025, 0.04]} material={paint(i % 2 ? '#c98a4a' : '#b8733a')} />
      ))}
      <mesh position={[-0.02, 0.2, -0.17]} rotation={[-0.4, 0, 0]} geometry={geo.box} scale={[0.12, 0.16, 0.008]} material={paint('#22331f')} />
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[Math.sin(i * 1.3) * 0.12, 0.183, Math.cos(i * 2.2) * 0.12]} material={paint('#78c25a')}>
          <cylinderGeometry args={[0.012, 0.012, 0.01, 8]} />
        </mesh>
      ))}
      {/* chopsticks */}
      {[0, 1].map((i) => (
        <mesh key={i} position={[0.05 + i * 0.03, 0.22, 0.0]} rotation={[0, 0.3, Math.PI / 2 - 0.05]} material={paint('#b9844e')}>
          <cylinderGeometry args={[0.006, 0.009, 0.62, 6]} />
        </mesh>
      ))}
      <Steam position={[0, 0.22, 0]} count={16} height={0.8} spread={0.1} />
    </group>
  );
}

export function Bread() {
  return (
    <group>
      <mesh position={[0, 0.03, 0]} geometry={geo.box} scale={[0.75, 0.05, 0.42]} material={paint('#a36a3c')} castShadow receiveShadow />
      <mesh position={[0, 0.16, 0]} scale={[0.3, 0.13, 0.17]} material={paint('#c98a45', { roughness: 0.75 })} castShadow>
        <sphereGeometry args={[1, 28, 18]} />
      </mesh>
      {[-0.14, -0.04, 0.06, 0.16].map((x) => (
        <mesh key={x} position={[x, 0.275, 0]} rotation={[0, 0, 0.5]} scale={[0.02, 0.012, 0.13]} material={paint('#f1d39c')}>
          <sphereGeometry args={[1, 10, 6]} />
        </mesh>
      ))}
      {/* a cut slice */}
      <mesh position={[0.36, 0.12, 0.05]} rotation={[0, 0.2, Math.PI / 2 - 0.25]} material={paint('#f4e1b8')}>
        <cylinderGeometry args={[0.11, 0.11, 0.035, 20]} />
      </mesh>
      <mesh position={[-0.33, 0.1, 0.14]} geometry={geo.box} scale={[0.32, 0.015, 0.05]} rotation={[0, 0.4, 0]} material={paint('#c9ccd1', { metalness: 0.8, roughness: 0.3 })} />
    </group>
  );
}

export function Cake() {
  const berries = useMemo(() => Array.from({ length: 9 }, (_, i) => (i / 9) * Math.PI * 2), []);
  return (
    <group>
      {/* stand */}
      <mesh position={[0, 0.06, 0]} material={paint('#e9e2d6', { roughness: 0.3 })} castShadow>
        <cylinderGeometry args={[0.06, 0.12, 0.12, 20]} />
      </mesh>
      <mesh position={[0, 0.13, 0]} material={paint('#f6f1e8', { roughness: 0.3 })} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.025, 32]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.18 + i * 0.075, 0]} material={paint(i % 2 ? '#fff9f0' : '#f1d590')} castShadow>
          <cylinderGeometry args={[0.24, 0.24, i % 2 ? 0.03 : 0.07, 32]} />
        </mesh>
      ))}
      <mesh position={[0, 0.355, 0]} material={paint('#fffaf2', { roughness: 0.5 })}>
        <cylinderGeometry args={[0.245, 0.245, 0.04, 32]} />
      </mesh>
      {berries.map((a, i) => (
        <group key={i} position={[Math.cos(a) * 0.17, 0.4, Math.sin(a) * 0.17]} rotation={[Math.PI, a, 0]}>
          <mesh material={paint('#e2394b', { roughness: 0.35 })}>
            <coneGeometry args={[0.032, 0.06, 10]} />
          </mesh>
          <mesh position={[0, 0.035, 0]} material={paint('#4f9a3a')}>
            <coneGeometry args={[0.025, 0.012, 5]} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2).map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.24, 0.37, Math.sin(a) * 0.24]} material={paint('#fffaf2')}>
          <sphereGeometry args={[0.022, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

export function Pancakes() {
  return (
    <group>
      <Plate r={0.9} />
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[(i % 2) * 0.006, 0.04 + i * 0.038, 0]} material={paint('#d79a52', { roughness: 0.7 })} castShadow>
          <cylinderGeometry args={[0.18 - i * 0.003, 0.18, 0.036, 28]} />
        </mesh>
      ))}
      <mesh position={[0, 0.235, 0]} material={paint('#d98a1f', { roughness: 0.1, transparent: true, opacity: 0.88 })}>
        <cylinderGeometry args={[0.172, 0.178, 0.012, 28]} />
      </mesh>
      {[0.6, 2.2, 4.1].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.17, 0.17, Math.sin(a) * 0.17]} scale={[0.02, 0.07, 0.02]} material={paint('#d98a1f', { roughness: 0.1 })}>
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
      ))}
      <mesh position={[0.02, 0.26, 0.01]} rotation={[0, 0.5, 0]} geometry={geo.box} scale={[0.07, 0.04, 0.07]} material={paint('#fbe7a1', { roughness: 0.4 })} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.22 + i * 0.03, 0.04, 0.12 - i * 0.05]} material={paint('#3b4fa8', { roughness: 0.3 })}>
          <sphereGeometry args={[0.022, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

export function Chai() {
  const pot = paint('#4f7d8c', { roughness: 0.35 });
  return (
    <group>
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.14, 0]} scale={[1, 0.85, 1]} material={pot} castShadow>
          <sphereGeometry args={[0.15, 24, 16]} />
        </mesh>
        <mesh position={[0, 0.27, 0]} material={pot}>
          <cylinderGeometry args={[0.07, 0.09, 0.04, 16]} />
        </mesh>
        <mesh position={[0, 0.305, 0]} material={paint('#e7b45a', { metalness: 0.6, roughness: 0.3 })}>
          <sphereGeometry args={[0.025, 10, 8]} />
        </mesh>
        <mesh position={[0.17, 0.17, 0]} rotation={[0, 0, -0.9]} material={pot}>
          <cylinderGeometry args={[0.015, 0.03, 0.17, 10]} />
        </mesh>
        <mesh position={[-0.16, 0.15, 0]} rotation={[0, 0, Math.PI / 2]} material={pot}>
          <torusGeometry args={[0.06, 0.014, 8, 16, Math.PI]} />
        </mesh>
        <Steam position={[0.23, 0.24, 0]} count={10} height={0.5} spread={0.05} size={40} />
      </group>
      {[
        [0.28, 0.12],
        [0.16, -0.2],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.045, 0]} material={paint('#fbf7ef', { roughness: 0.3 })} castShadow>
            <cylinderGeometry args={[0.05, 0.038, 0.09, 18, 1, true]} />
          </mesh>
          <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} material={paint('#b7773f', { roughness: 0.2 })}>
            <circleGeometry args={[0.047, 18]} />
          </mesh>
          <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={paint('#fbf7ef')}>
            <circleGeometry args={[0.04, 18]} />
          </mesh>
          <Steam position={[0, 0.09, 0]} count={6} height={0.35} spread={0.03} size={30} opacity={0.25} />
        </group>
      ))}
    </group>
  );
}

export function FruitBowl() {
  const fruits: [number, number, number, string, number][] = [
    [0, 0.12, 0, '#e86a4a', 0.07],
    [0.08, 0.1, 0.05, '#f2a25a', 0.065],
    [-0.08, 0.1, 0.04, '#9cc85a', 0.065],
    [0.02, 0.1, -0.08, '#e2394b', 0.06],
    [-0.04, 0.17, -0.02, '#f2d16b', 0.06],
  ];
  return (
    <group>
      <mesh geometry={bowlGeo} scale={[0.75, 0.6, 0.75]} material={paint('#8fae7a', { roughness: 0.4 })} castShadow />
      {fruits.map(([x, y, z, c, s], i) => (
        <mesh key={i} position={[x, y, z]} material={paint(c, { roughness: 0.45 })} castShadow>
          <sphereGeometry args={[s, 14, 10]} />
        </mesh>
      ))}
    </group>
  );
}

export function Sandwich() {
  const bread = paint('#e9c27e', { roughness: 0.85 });
  const crust = paint('#b97a3c', { roughness: 0.9 });
  const half = (flip: number) => (
    <group rotation={[0, flip ? Math.PI : 0, 0]} position={[flip ? -0.06 : 0.06, 0, flip ? 0.03 : -0.03]}>
      {[
        [0.02, bread, 0.03],
        [0.045, paint('#7cc25a'), 0.012],
        [0.06, paint('#f2c94c', { roughness: 0.6 }), 0.012],
        [0.075, paint('#e8d3b8'), 0.02],
        [0.092, paint('#e2463b', { roughness: 0.5 }), 0.012],
        [0.115, bread, 0.03],
      ].map(([y, m, h], i) => (
        <mesh key={i} position={[0, y as number, 0]} rotation={[0, Math.PI / 6, 0]} material={m as THREE.Material} castShadow>
          <cylinderGeometry args={[i === 1 ? 0.19 : 0.175, i === 1 ? 0.19 : 0.175, h as number, 3]} />
        </mesh>
      ))}
      <mesh position={[0, 0.131, 0]} rotation={[0, Math.PI / 6, 0]} material={crust}>
        <cylinderGeometry args={[0.176, 0.176, 0.004, 3]} />
      </mesh>
    </group>
  );
  return (
    <group>
      <Plate r={0.95} />
      <group position={[0, 0.015, 0]}>
        {half(0)}
        {half(1)}
      </group>
      <mesh position={[0.05, 0.2, -0.02]} geometry={geo.cyl} scale={[0.004, 0.16, 0.004]} material={paint('#e9d8b4')} />
      <mesh position={[0.05, 0.285, -0.02]} material={paint('#3f5a2a')}>
        <sphereGeometry args={[0.018, 10, 8]} />
      </mesh>
    </group>
  );
}

export function RoastChicken() {
  const skin = paint('#c47a36', { roughness: 0.45 });
  const dark = paint('#a35f2a', { roughness: 0.5 });
  return (
    <group>
      <mesh scale={[1.25, 1, 0.9]} geometry={plateGeo} material={paint('#f6f1e8', { roughness: 0.3 })} castShadow receiveShadow />
      <mesh position={[0, 0.13, 0]} scale={[0.2, 0.12, 0.15]} material={skin} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      <mesh position={[0, 0.2, 0]} scale={[0.14, 0.05, 0.1]} material={dark}>
        <sphereGeometry args={[1, 16, 10]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[0.15, 0.12, s * 0.09]} rotation={[s * 0.3, 0, -0.9]}>
          <mesh scale={[0.06, 0.1, 0.06]} material={skin} castShadow>
            <sphereGeometry args={[1, 14, 10]} />
          </mesh>
          <mesh position={[0, 0.11, 0]} geometry={geo.cyl} scale={[0.014, 0.06, 0.014]} material={paint('#f4ead8')} />
          <mesh position={[0, 0.145, 0]} material={paint('#f4ead8')}>
            <sphereGeometry args={[0.02, 8, 6]} />
          </mesh>
        </group>
      ))}
      {/* potatoes, lemon, cherry tomatoes, rosemary */}
      {[
        [-0.27, 0.05, 0.08],
        [-0.25, 0.05, -0.1],
        [0.0, 0.05, 0.2],
        [0.05, 0.05, -0.2],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} scale={[0.05, 0.04, 0.045]} rotation={[0, i, 0]} material={paint('#d9a04f', { roughness: 0.6 })} castShadow>
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>
      ))}
      <group position={[-0.3, 0.05, -0.0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={paint('#f2d34a', { roughness: 0.5 })}>
          <sphereGeometry args={[0.045, 14, 10, 0, Math.PI]} />
        </mesh>
      </group>
      {[
        [0.24, 0.04, 0.16],
        [0.28, 0.04, -0.12],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} material={paint('#e2394b', { roughness: 0.35 })}>
          <sphereGeometry args={[0.025, 10, 8]} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.12 + i * 0.12, 0.04, 0.24 - (i % 2) * 0.48]} rotation={[0, i * 1.2, Math.PI / 2]} geometry={geo.cyl} scale={[0.006, 0.12, 0.006]} material={paint('#4f7a3a')} />
      ))}
      <Steam position={[0, 0.22, 0]} count={14} height={0.7} spread={0.12} size={55} />
    </group>
  );
}

export function WhiteSaucePasta() {
  const penne = useMemo(() => {
    const out: { p: [number, number, number]; r: [number, number, number] }[] = [];
    let seed = 3;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 0.17;
      out.push({ p: [Math.cos(a) * d, 0.145 + r() * 0.05, Math.sin(a) * d], r: [r() * 3, r() * 3, r() * 3] });
    }
    return out;
  }, []);
  const pasta = paint('#f1d48a', { roughness: 0.55 });
  return (
    <group>
      <mesh geometry={bowlGeo} scale={[1.15, 0.75, 1.15]} material={paint('#fbf7ef', { roughness: 0.3 })} castShadow receiveShadow />
      <mesh position={[0, 0.13, 0]} scale={[0.27, 0.05, 0.27]} material={paint('#f6eed8', { roughness: 0.35 })}>
        <sphereGeometry args={[1, 24, 12]} />
      </mesh>
      {penne.map((n, i) => (
        <mesh key={i} position={n.p} rotation={n.r} material={pasta}>
          <cylinderGeometry args={[0.014, 0.014, 0.06, 10, 1, true]} />
        </mesh>
      ))}
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} position={[Math.sin(i * 2.4) * 0.15 * ((i % 3) / 3 + 0.3), 0.19, Math.cos(i * 1.9) * 0.15 * ((i % 4) / 4 + 0.2)]} material={paint(i % 3 ? '#4f9a3a' : '#2b2a26')}>
          <sphereGeometry args={[0.007, 6, 4]} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.05 + i * 0.05, 0.2, 0.02 - i * 0.03]} rotation={[-Math.PI / 2, 0, i]} geometry={geo.box} scale={[0.05, 0.03, 0.004]} material={paint('#fff6dc')} />
      ))}
      <mesh position={[0.24, 0.13, 0.1]} rotation={[0.2, 0.6, Math.PI / 2 - 0.3]} geometry={geo.cyl} scale={[0.008, 0.36, 0.008]} material={paint('#c9ccd1', { metalness: 0.8, roughness: 0.3 })} />
      <Steam position={[0, 0.2, 0]} count={12} height={0.6} spread={0.1} size={50} />
    </group>
  );
}
