import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js'
import { D, measure, unitsPerPx, useAnchors } from './anchors'
import { makeEnv, makeSky, glowTex, raysTex, starTex } from './textures'

const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const mobile = typeof innerWidth !== 'undefined' && innerWidth < 900
const chrome = new THREE.MeshStandardMaterial({ color: 0xcfd8ea, metalness: 1, roughness: 0.07, envMapIntensity: 1.15 })

// Shared pointer, smoothed in the rig
const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
if (typeof window !== 'undefined') {
  addEventListener('pointermove', (e) => { pointer.tx = e.clientX / innerWidth - 0.5; pointer.ty = e.clientY / innerHeight - 0.5 })
}

/* Re-measure an anchor box whenever the layout changes */
function useLayout(anchor) {
  const { camera, size } = useThree()
  const [lay, setLay] = useState(null)
  useLayoutEffect(() => {
    const m = () => setLay(measure(anchor.el, anchor.z, camera.fov))
    m()
    document.fonts?.ready.then(m)
    const ro = new ResizeObserver(m)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [anchor, camera, size.width, size.height])
  return lay
}

function Atmosphere() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    scene.background = makeSky()
    scene.environment = makeEnv(gl)
    // Warm up shaders so the first scroll doesn't hitch
    const id = setTimeout(() => gl.compile(scene, camera), 300)
    return () => clearTimeout(id)
  }, [gl, scene, camera])
  return null
}

/* Camera follows the page scroll 1:1 (plus a little mouse parallax) */
function Rig() {
  const camY = useRef(null)
  useFrame(({ camera }, dt) => {
    const target = -(scrollY + innerHeight / 2) * unitsPerPx(camera.fov)
    if (camY.current === null || reduce) camY.current = target
    camY.current += (target - camY.current) * (1 - Math.exp(-dt * 9))
    pointer.x += (pointer.tx - pointer.x) * 0.05
    pointer.y += (pointer.ty - pointer.y) * 0.05
    camera.position.set(pointer.x * 0.5, camY.current - pointer.y * 0.3, D)
  })
  return null
}

function near(obj, camera) {
  return Math.abs(obj.position.y - camera.position.y) < innerHeight * unitsPerPx(camera.fov) * 1.3
}

/* Glowing orb, concentric light rings and sparkles */
function Halo({ anchor }) {
  const lay = useLayout(anchor)
  const g = useRef(), rings = useRef(), rays = useRef(), glow = useRef()
  const tex = useMemo(() => ({ glow: glowTex(), rays: raysTex(), star: starTex() }), [])
  const ringData = useMemo(() => [1.15, 1.9, 2.75, 3.7, 4.75].map((r, i) => {
    const n = 10 + i * 6, pos = new Float32Array(n * 3)
    for (let k = 0; k < n; k++) { const a = Math.random() * Math.PI * 2; pos.set([Math.cos(a) * r, Math.sin(a) * r, 0], k * 3) }
    return { r, i, pos, speed: (i % 2 ? -1 : 1) * (0.03 + i * 0.012) }
  }), [])
  const sparkMats = useRef([])
  const intro = useRef(0)

  useFrame(({ camera, clock }, dt) => {
    if (!lay || !g.current) return
    g.current.visible = near(g.current, camera)
    const t = clock.elapsedTime
    intro.current = Math.min(1, intro.current + dt * 0.6)
    const ease = 1 - Math.pow(1 - intro.current, 3)
    const s = lay.w / 9.5
    g.current.position.set(lay.x, lay.y + Math.sin(t * 0.8) * 0.06 * s, lay.z)
    g.current.scale.setScalar(s)
    g.current.rotation.set(pointer.y * 0.15, pointer.x * 0.25, 0)
    rings.current.children.forEach((r, i) => {
      if (!reduce) r.rotation.z += ringData[i].speed * dt
      r.scale.setScalar(0.6 + 0.4 * Math.min(1, ease * 1.4 - i * 0.08))
    })
    rays.current.material.rotation = t * 0.03
    glow.current.scale.setScalar(3 + Math.sin(t * 1.4) * 0.2)
    sparkMats.current.forEach((m, i) => m && (m.opacity = 0.55 + 0.45 * Math.sin(t * 2.2 + i * 1.7)))
  })

  return (
    <group ref={g} visible={!!lay}>
      <mesh>
        <sphereGeometry args={[0.42, 48, 32]} />
        <meshStandardMaterial color={0xcfd8ea} metalness={1} roughness={0.07} emissive={[1.1, 1.15, 1.35]} />
      </mesh>
      <sprite ref={glow} scale={3}>
        <spriteMaterial map={tex.glow} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
      </sprite>
      <sprite ref={rays} scale={11}>
        <spriteMaterial map={tex.rays} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.32} />
      </sprite>
      <group ref={rings} rotation={[0.32, -0.38, 0]}>
        {ringData.map(({ r, i, pos }) => (
          <mesh key={r}>
            <torusGeometry args={[r, 0.008 + i * 0.0015, 8, 220]} />
            <meshBasicMaterial color={[1.25, 1.3, 1.5]} toneMapped={false} />
            <points>
              <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
              <pointsMaterial ref={(m) => (sparkMats.current[i] = m)} map={tex.star} size={0.32} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
            </points>
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* Liquid-chrome cloud: metaballs built once, then animated by transform only */
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

function Cloud({ anchor, seed }) {
  const lay = useLayout(anchor)
  const mc = useMemo(() => {
    const rand = mulberry(seed)
    const m = new MarchingCubes(mobile ? 26 : 34, chrome, false, false, 40000)
    m.isolation = 60
    m.reset()
    for (let i = 0; i < 7; i++) {
      const t = i / 6
      m.addBall(0.24 + t * 0.52 + (rand() - 0.5) * 0.04, 0.44 + (rand() - 0.5) * 0.03, 0.5 + (rand() - 0.5) * 0.08, 0.32 + rand() * 0.1, 12)
    }
    for (let i = 0; i < 3; i++) m.addBall(0.34 + rand() * 0.32, 0.53 + rand() * 0.07, 0.5 + (rand() - 0.5) * 0.06, 0.38 + rand() * 0.14, 12)
    m.update()
    return m
  }, [seed])

  useFrame(({ camera, clock }) => {
    if (!lay) return
    const t = clock.elapsedTime, s = lay.w / 4.6
    mc.visible = near(mc, camera)
    mc.position.set(lay.x, lay.y + Math.sin(t * 0.5 + lay.x) * 0.15, lay.z)
    mc.scale.set(2.4 * s, 1.25 * s, 1.5 * s)
    mc.rotation.set(0, Math.sin(t * 0.25 + lay.x) * 0.25 + pointer.x * 0.3, Math.sin(t * 0.4 + lay.y) * 0.04)
  })
  return <primitive object={mc} visible={!!lay} />
}

/* Chrome gyroscope */
function Gyro({ anchor }) {
  const lay = useLayout(anchor)
  const g = useRef()
  const axes = useMemo(() => [[0.3, 1, 0.4], [1, 0.2, 0.4], [0.3, 0.2, 1]].map((v) => new THREE.Vector3(...v).normalize()), [])
  useFrame(({ camera }, dt) => {
    if (!lay) return
    g.current.visible = near(g.current, camera)
    g.current.position.set(lay.x, lay.y, lay.z)
    g.current.scale.setScalar(lay.w / 4.2)
    g.current.rotation.y = pointer.x * 0.4
    if (!reduce) g.current.children.forEach((c, i) => axes[i] && c.rotateOnAxis(axes[i], (0.25 + i * 0.12) * dt))
  })
  return (
    <group ref={g} visible={!!lay}>
      {[1.9, 1.55, 1.2].map((r) => (
        <mesh key={r} material={chrome}><torusGeometry args={[r, 0.14, 32, 160]} /></mesh>
      ))}
      <mesh material={chrome}><sphereGeometry args={[0.55, 48, 32]} /></mesh>
    </group>
  )
}

/* Sparkle field across the whole page */
function Stars() {
  const { camera, size } = useThree()
  const tex = useMemo(starTex, [])
  const mat = useRef()
  const pos = useMemo(() => {
    const k = unitsPerPx(camera.fov), pageH = document.documentElement.scrollHeight
    const n = mobile ? 90 : 180, a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) a.set([(Math.random() - 0.5) * innerWidth * k * 1.3, -Math.random() * pageH * k, -2 - Math.random() * 6], i * 3)
    return a
  }, [camera, size.width, size.height])
  useFrame(({ clock }) => { if (mat.current) mat.current.opacity = 0.65 + 0.3 * Math.sin(clock.elapsedTime * 1.7) })
  return (
    <points key={pos.length + ':' + size.height}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial ref={mat} map={tex} size={0.22} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

export default function Scene() {
  const anchors = useAnchors()
  return (
    <Canvas
      className="gl"
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      dpr={[1, mobile ? 1.5 : 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 40, near: 0.1, far: 200, position: [0, 0, D] }}
      aria-hidden="true"
    >
      <Atmosphere />
      <Rig />
      {anchors.map((a, i) =>
        a.type === 'halo' ? <Halo key={a.id} anchor={a} />
          : a.type === 'cloud' ? <Cloud key={a.id} anchor={a} seed={7 + i} />
            : <Gyro key={a.id} anchor={a} />,
      )}
      <Stars />
      <EffectComposer multisampling={4}>
        <Bloom intensity={0.55} luminanceThreshold={0.9} luminanceSmoothing={0.15} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  )
}
