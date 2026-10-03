import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

/*
  Full-screen backgrounds for night / gold / crimson. Each is clipped to the section(s) that use
  that world, with a slanted edge, so scrolling wipes diagonally from one world to the next.
  (The "air" world is the 3D sky behind everything.)
*/
export default function Worlds() {
  const refs = useRef({})

  useEffect(() => {
    const worlds = Object.entries(refs.current).map(([name, el]) => ({
      el, secs: [...document.querySelectorAll(`main section[data-world="${name}"]`)],
    }))
    const clip = () => {
      const slant = Math.min(innerWidth * 0.09, 140)
      for (const w of worlds) {
        if (!w.secs.length) continue
        const top = w.secs[0].getBoundingClientRect().top
        const bottom = w.secs[w.secs.length - 1].getBoundingClientRect().bottom
        const visible = bottom + slant > 0 && top - slant < innerHeight
        w.el.style.visibility = visible ? 'visible' : 'hidden'
        if (visible) w.el.style.clipPath = `polygon(0 ${top + slant}px, 100% ${top - slant}px, 100% ${bottom - slant}px, 0 ${bottom + slant}px)`
      }
    }
    gsap.ticker.add(clip)
    return () => gsap.ticker.remove(clip)
  }, [])

  return (
    <>
      <div className="world" data-world="night" ref={(el) => (refs.current.night = el)} aria-hidden="true">
        <Particles mode="stars" />
        <i className="bethlehem" />
      </div>
      <div className="world" data-world="gold" ref={(el) => (refs.current.gold = el)} aria-hidden="true"><i className="rays" /></div>
      <div className="world" data-world="crimson" ref={(el) => (refs.current.crimson = el)} aria-hidden="true">
        <Particles mode="embers" />
      </div>
    </>
  )
}

/* Twinkling stars for the night, rising embers for the cross */
function Particles({ mode }) {
  const ref = useRef()
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d'), host = c.parentElement
    const stars = mode === 'stars'
    let parts = []
    const spawn = (anywhere) => stars
      ? { x: Math.random() * innerWidth, y: Math.random() * innerHeight * 0.85, r: Math.random() ** 3 * 1.8 + 0.3, tw: Math.random() * 6.28, sp: 0.5 + Math.random() * 2 }
      : { x: innerWidth * (0.3 + Math.random() * 0.7), y: anywhere ? Math.random() * innerHeight : innerHeight + 10,
          r: 0.6 + Math.random() * 2, vy: 0.3 + Math.random() * 1.2, sway: Math.random() * 6.28, life: 0.4 + Math.random() * 0.6 }
    const size = () => {
      const dpr = Math.min(devicePixelRatio, 2)
      c.width = innerWidth * dpr; c.height = innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      parts = Array.from({ length: stars ? (innerWidth < 900 ? 160 : 320) : (innerWidth < 900 ? 60 : 120) }, () => spawn(true))
    }
    let t = 0
    const draw = () => {
      if (host.style.visibility !== 'visible') return
      t += 0.016
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of parts) {
        if (stars) {
          const a = reduce ? 0.8 : 0.35 + 0.65 * Math.abs(Math.sin(t * p.sp + p.tw))
          ctx.fillStyle = `rgba(220,232,255,${a})`
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill()
          continue
        }
        if (!reduce) { p.y -= p.vy; p.sway += 0.03; p.x += Math.sin(p.sway) * 0.5 }
        if (p.y < -10) Object.assign(p, spawn(false))
        const a = Math.min(1, p.y / innerHeight + 0.15) * p.life
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
        g.addColorStop(0, `rgba(255,170,140,${a})`); g.addColorStop(0.4, `rgba(220,20,20,${a * 0.6})`); g.addColorStop(1, 'rgba(120,0,0,0)')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill()
      }
    }
    size()
    addEventListener('resize', size)
    gsap.ticker.add(draw)
    return () => { removeEventListener('resize', size); gsap.ticker.remove(draw) }
  }, [mode])
  return <canvas ref={ref} className="particles" />
}
