import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// Built-in 3D stand-ins for each chapter. Each is roughly 3–3.5 units tall, centred at the origin.
// They take a shared `material` so the stage can recolour them per world.

const bevel = { depth: 0.22, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.1, bevelSegments: 8, curveSegments: 48 }

function centred(geo) { geo.center(); geo.computeVertexNormals(); return geo }

/* I · Birth: the star of Bethlehem, a long four-point star */
export function Star({ material }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    const pts = 8
    for (let i = 0; i <= pts; i++) {
      const a = Math.PI / 2 + (i / pts) * Math.PI * 2
      const tip = i % 2 === 0
      // vertical points longer than horizontal ones
      const r = tip ? (i % 4 === 0 ? 1.85 : 1.15) : 0.26
      const p = [Math.cos(a) * r, Math.sin(a) * r]
      i === 0 ? s.moveTo(...p) : s.lineTo(...p)
    }
    return centred(new THREE.ExtrudeGeometry(s, { ...bevel, depth: 0.12, bevelThickness: 0.2, bevelSize: 0.12, curveSegments: 4 }))
  }, [])
  return <mesh geometry={geo} material={material} />
}

/* II · Life: the ichthys, the fish of the first believers (and of the loaves and fishes) */
function quad(p0, c, p1, t) {
  const u = 1 - t
  return new THREE.Vector2(u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1])
}
export function Fish({ material }) {
  const geos = useMemo(() => {
    const nose = [1.6, 0], t1 = [-1.6, -0.72], t2 = [-1.6, 0.72]
    const up = [0, 1.45], down = [0, -1.45]
    // The two arcs cross at t = 0.8: body = both arcs up to that point, tail = the rest
    const body = []
    for (let i = 0; i <= 40; i++) body.push(quad(nose, up, t1, (i / 40) * 0.8))
    for (let i = 40; i >= 0; i--) body.push(quad(nose, down, t2, (i / 40) * 0.8))
    const tail = []
    for (let i = 0; i <= 12; i++) tail.push(quad(nose, up, t1, 0.8 + (i / 12) * 0.2))
    for (let i = 12; i >= 0; i--) tail.push(quad(nose, down, t2, 0.8 + (i / 12) * 0.2))
    const opts = { ...bevel, depth: 0.28, bevelThickness: 0.16, bevelSize: 0.08 }
    const b = new THREE.ExtrudeGeometry(new THREE.Shape(body), opts)
    const t = new THREE.ExtrudeGeometry(new THREE.Shape(tail), opts)
    for (const g of [b, t]) { g.translate(0, 0, -0.14); g.computeVertexNormals() }
    return [b, t]
  }, [])
  return (
    <group scale={1.1}>
      {geos.map((g, i) => <mesh key={i} geometry={g} material={material} />)}
      {/* eye */}
      <mesh position={[0.95, 0.12, 0.2]} material={material}><sphereGeometry args={[0.07, 24, 16]} /></mesh>
    </group>
  )
}

/* III · Death: the cross, with a crown of thorns hung at its centre */
export function Cross({ material }) {
  const thorns = useMemo(() => {
    const n = 46, list = []
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.1
      list.push({ a, tilt: (Math.random() - 0.5) * 1.2, len: 0.16 + Math.random() * 0.12, up: Math.random() > 0.5 ? 1 : -1 })
    }
    return list
  }, [])
  const v = useMemo(() => new RoundedBoxGeometry(0.5, 3.6, 0.5, 6, 0.18), [])
  const h = useMemo(() => new RoundedBoxGeometry(2.3, 0.5, 0.5, 6, 0.18), [])
  return (
    <group>
      <mesh geometry={v} material={material} />
      <mesh geometry={h} material={material} position={[0, 0.78, 0]} />
      <group position={[0, 0.78, 0.38]} rotation={[0.35, 0, 0.12]}>
        {[0, 0.6, 1.2].map((r) => (
          <mesh key={r} rotation={[0, 0, r]} material={material}><torusGeometry args={[0.62, 0.045, 10, 90]} /></mesh>
        ))}
        {thorns.map((t, i) => (
          <mesh key={i} material={material}
                position={[Math.cos(t.a) * 0.62, Math.sin(t.a) * 0.62, 0]}
                rotation={[t.tilt * t.up, t.tilt, t.a - Math.PI / 2]}>
            <coneGeometry args={[0.025, t.len, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* IV · Resurrection: the great stone, rolled away, with light breaking from behind */
export function Stone({ material, glow }) {
  const geo = useMemo(() => {
    // Lathe a rounded-edge millstone profile
    const pts = []
    const R = 1.45, T = 0.28, r = 0.14
    pts.push(new THREE.Vector2(0.001, -T))
    for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; pts.push(new THREE.Vector2(R - r + Math.cos(a) * r * 1.6, Math.sin(a) * (T))) }
    pts.push(new THREE.Vector2(0.001, T))
    const g = new THREE.LatheGeometry(pts, 96)
    g.rotateX(Math.PI / 2)
    return g
  }, [])
  return (
    <group>
      <mesh geometry={geo} material={material} position={[0.35, -0.1, 0]} rotation={[0, -0.5, 0]} />
      {/* light from the open tomb */}
      <mesh position={[-0.6, 0, -0.6]}>
        <ringGeometry args={[1.35, 1.42, 128]} />
        <meshBasicMaterial color={glow} toneMapped={false} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.6, 0, -0.7]}>
        <circleGeometry args={[1.35, 96]} />
        <meshBasicMaterial color={glow} toneMapped={false} transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

export const RELICS = { birth: Star, life: Fish, death: Cross, resurrection: Stone }
