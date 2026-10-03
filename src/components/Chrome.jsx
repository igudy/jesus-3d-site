import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react'
import { useState } from 'react'
import { railItems } from '../data/content'
import { Btn } from './primitives'

export function Nav() {
  return (
    <motion.nav initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}>
      <a className="logo" href="#top">
        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 0l1.6 8.4L20 10l-8.4 1.6L10 20l-1.6-8.4L0 10l8.4-1.6z" /></svg>
        The Story
      </a>
      <ul>
        <li><a href="#birth">Birth</a></li>
        <li><a href="#life">Life</a></li>
        <li><a href="#death">Death</a></li>
        <li><a href="#resurrection">Resurrection</a></li>
      </ul>
      <Btn href="#begin" size="sm">Begin</Btn>
    </motion.nav>
  )
}

export function Rail({ active }) {
  return (
    <ul className="rail" aria-hidden="true">
      {railItems.map(([id, label]) => (
        <li key={id} className={active === id ? 'on' : ''}><span>{label}</span></li>
      ))}
    </ul>
  )
}

export function Progress() {
  const { scrollYProgress } = useScroll()
  const [pct, setPct] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setPct(Math.round(v * 100)))
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  return (
    <>
      <motion.div className="progress-bar" style={{ scaleX }} aria-hidden="true" />
      <div className="pct" aria-hidden="true">{pct}%</div>
    </>
  )
}

export function GridLines() {
  return (
    <div className="grid" aria-hidden="true">
      <div className="h" style={{ top: 72 }} />
      <div className="v" style={{ left: 'calc(var(--gutter) + 90px)' }} />
      <div className="plus" style={{ top: 72, left: 'calc(var(--gutter) + 90px)' }} />
      <div className="plus" style={{ top: 72, left: '66%' }} />
    </div>
  )
}
