import * as THREE from 'three'

function canvasTex(size, draw) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d'), size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function makeSky() {
  return canvasTex(1024, (g, s) => {
    const gr = g.createLinearGradient(0, 0, 0, s)
    gr.addColorStop(0, '#1546c9'); gr.addColorStop(0.55, '#3f78ec'); gr.addColorStop(1, '#a9c6fb')
    g.fillStyle = gr; g.fillRect(0, 0, s, s)
    g.filter = 'blur(42px)'
    for (let i = 0; i < 16; i++) {
      g.fillStyle = `rgba(255,255,255,${0.06 + Math.random() * 0.14})`
      g.beginPath()
      g.ellipse(Math.random() * s, 380 + Math.random() * 640, 90 + Math.random() * 220, 26 + Math.random() * 60, 0, 0, Math.PI * 2)
      g.fill()
    }
  })
}

// Sky-gradient room with a few bright panels: gives chrome its blue-sky reflections.
export function makeEnv(renderer) {
  const s = new THREE.Scene()
  s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vP; void main(){
      float y = vP.y;
      vec3 top = vec3(.06,.22,.95), hor = vec3(1.7,1.8,2.1), gnd = vec3(.04,.06,.16);
      vec3 c = y > 0. ? mix(hor, top, pow(y,.4)) : mix(hor*.5, gnd, pow(-y,.3));
      gl_FragColor = vec4(c,1.); }`,
  })))
  const pm = new THREE.MeshBasicMaterial({ color: new THREE.Color(8, 8, 8) })
  for (const [x, y, z, w, h] of [[-20, 24, 12, 12, 4], [24, 14, -10, 5, 10], [0, 32, -22, 16, 3], [-14, -4, -24, 6, 2]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), pm)
    m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m)
  }
  const pmrem = new THREE.PMREMGenerator(renderer)
  const tex = pmrem.fromScene(s, 0.01).texture
  pmrem.dispose()
  return tex
}

export const glowTex = () => canvasTex(256, (g, s) => {
  const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.15, 'rgba(225,235,255,.7)')
  r.addColorStop(0.45, 'rgba(160,190,255,.15)'); r.addColorStop(1, 'rgba(120,160,255,0)')
  g.fillStyle = r; g.fillRect(0, 0, s, s)
})

export const raysTex = () => canvasTex(1024, (g, s) => {
  g.translate(s / 2, s / 2)
  for (let i = 0; i < 90; i++) {
    const a = Math.random() * Math.PI * 2, len = s * (0.18 + Math.random() * 0.32), w = 0.004 + Math.random() * 0.012
    const lg = g.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len)
    lg.addColorStop(0, `rgba(255,255,255,${0.25 + Math.random() * 0.35})`); lg.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = lg
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, len, a - w, a + w); g.closePath(); g.fill()
  }
})

export const starTex = () => canvasTex(128, (g, s) => {
  const c = s / 2
  const r = g.createRadialGradient(c, c, 0, c, c, c * 0.35)
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r; g.fillRect(0, 0, s, s)
  for (const [w, h] of [[s, 3], [3, s]]) {
    const lg = w > h ? g.createLinearGradient(0, 0, s, 0) : g.createLinearGradient(0, 0, 0, s)
    lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,1)'); lg.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = lg; g.fillRect(c - w / 2, c - h / 2, w, h)
  }
})
