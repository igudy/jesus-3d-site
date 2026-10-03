import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { makeEnv } from '../three/textures'
import { RELICS } from '../three/Relics'
import { chapters } from '../data/content'

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

// One metal per world: the same chrome becomes star-silver, gold, blood-red or dawn-white.
const METALS = {
  night: { color: '#c9dcff', emissive: '#1a3a8a', ei: 0.35, rough: 0.08 },
  gold: { color: '#f4c560', emissive: '#6a3a00', ei: 0.25, rough: 0.12 },
  crimson: { color: '#c4141e', emissive: '#4a0000', ei: 0.6, rough: 0.16 },
  air: { color: '#eef3ff', emissive: '#ffffff', ei: 0.05, rough: 0.05 },
}

const pointer = { x: 0, y: 0 }
addEventListener('pointermove', (e) => { pointer.x = e.clientX / innerWidth - 0.5; pointer.y = e.clientY / innerHeight - 0.5 })

/* Optional GLB: public/models/<relic>.glb replaces the built-in object */
function useModel(id) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    fetch(`/models/${id}.glb`, { method: 'HEAD' })
      .then((r) => setOk(r.ok && !(r.headers.get('content-type') || '').includes('text/html')))
      .catch(() => setOk(false))
  }, [id])
  return ok
}

function GLB({ url, material, keepMaterials }) {
  const gltf = useLoader(GLTFLoader, url)
  const scene = useMemo(() => {
    const s = gltf.scene.clone(true)
    const box = new THREE.Box3().setFromObject(s)
    const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3())
    const k = 3.4 / Math.max(size.x, size.y, size.z)
    s.scale.setScalar(k)
    s.position.set(-c.x * k, -c.y * k, -c.z * k)
    if (!keepMaterials) s.traverse((o) => { if (o.isMesh) o.material = material })
    return s
  }, [gltf, material, keepMaterials])
  return <primitive object={scene} />
}

function Relic({ id, active, side, material, glow }) {
  const g = useRef()
  const hasModel = useModel(id)
  const { viewport } = useThree()
  const Builtin = RELICS[id]
  const state = useRef({ s: 0, spin: 0, wasActive: false })

  useFrame(({ clock }, dt) => {
    const st = state.current
    if (active && !st.wasActive) st.spin = Math.PI * 1.5 // spin in when its chapter arrives
    st.wasActive = active
    const k = 1 - Math.exp(-dt * 4)
    st.s += ((active ? 1 : 0) - st.s) * k
    st.spin += (0 - st.spin) * (1 - Math.exp(-dt * 2.2))
    const o = g.current
    o.visible = st.s > 0.01
    if (!o.visible) return
    const narrow = viewport.width < 7
    const x = narrow ? 0 : (side === 'left' ? -1 : 1) * viewport.width * 0.2
    const t = clock.elapsedTime
    o.position.x += (x - o.position.x) * k
    o.position.y = (narrow ? -viewport.height * 0.18 : 0) + Math.sin(t * 0.9) * 0.08
    const s = st.s * (narrow ? 0.75 : 1)
    o.scale.setScalar(s)
    o.rotation.y = st.spin + (reduce ? 0 : Math.sin(t * 0.35) * 0.35) + pointer.x * 0.8
    o.rotation.x = pointer.y * 0.3
  })

  return (
    <group ref={g} scale={0}>
      {hasModel
        ? <Suspense fallback={<Builtin material={material} glow={glow} />}><GLB url={`/models/${id}.glb`} material={material} /></Suspense>
        : <Builtin material={material} glow={glow} />}
    </group>
  )
}

function StageScene({ world, chapter, side }) {
  const { gl, scene } = useThree()
  useEffect(() => { scene.environment = makeEnv(gl) }, [gl, scene])

  const material = useMemo(() => new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.08, envMapIntensity: 1.25 }), [])
  const glow = useMemo(() => new THREE.Color(2.2, 2.1, 1.8), [])
  const target = useMemo(() => ({ c: new THREE.Color(), e: new THREE.Color() }), [])

  // Ease the metal from one world's colour to the next
  useFrame((_, dt) => {
    const m = METALS[world] || METALS.air
    const k = 1 - Math.exp(-dt * 3)
    target.c.set(m.color); target.e.set(m.emissive)
    material.color.lerp(target.c, k)
    material.emissive.lerp(target.e, k)
    material.emissiveIntensity += (m.ei - material.emissiveIntensity) * k
    material.roughness += (m.rough - material.roughness) * k
  })

  return (
    <>
      {chapters.map((c) => (
        <Relic key={c.id} id={c.relic} active={chapter === c.id} side={c.stage} material={material} glow={glow} />
      ))}
    </>
  )
}

export default function Stage({ world, chapter }) {
  return (
    <div className="stage" aria-hidden="true">
      <Canvas className="stage-canvas" camera={{ fov: 35, position: [0, 0, 9] }} dpr={[1, 1.75]}
              gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <StageScene world={world} chapter={chapter} />
      </Canvas>
    </div>
  )
}
