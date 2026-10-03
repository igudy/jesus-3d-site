import { useLayoutEffect, useRef, useId } from 'react'
import { motion } from 'motion/react'
import { registerAnchor } from '../three/anchors'

const ease = [0.2, 0.7, 0.2, 1]

// Fade + rise into view, once.
export function Reveal({ as = 'div', delay = 0, y = 28, children, ...rest }) {
  const M = motion[as]
  return (
    <M initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
       transition={{ duration: 1.1, ease, delay }} {...rest}>
      {children}
    </M>
  )
}

// Headline whose letters rise out of a mask.
export function SplitText({ text, as = 'span', delay = 0, stagger = 0.04, className }) {
  const M = motion[as]
  return (
    <M className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
       transition={{ staggerChildren: stagger, delayChildren: delay }}>
      {text.split(' ').map((word, w, words) => (
        // Letters animate individually, but each word stays unbreakable
        <span key={w} className="word" aria-hidden="true">
          {[...word].map((ch, i) => (
            <span key={i} className="split">
              <motion.span variants={{ hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 1, ease } } }}>{ch}</motion.span>
            </span>
          ))}
          {w < words.length - 1 && ' '}
        </span>
      ))}
    </M>
  )
}

export function Btn({ href, children, tone, size, ...rest }) {
  const cls = ['btn', tone, size].filter(Boolean).join(' ')
  const ext = href?.startsWith('http')
  return (
    <motion.a className={cls} href={href} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              {...(ext ? { target: '_blank', rel: 'noopener' } : {})} {...rest}>
      {children} <span className="arr">→</span>
    </motion.a>
  )
}

// Invisible box a 3D object pins itself to (see three/anchors.js).
export function Anchor({ type, z = 0, className }) {
  const ref = useRef()
  const id = useId()
  useLayoutEffect(() => registerAnchor({ id, type, z, el: ref.current }), [id, type, z])
  return <div ref={ref} className={`anchor ${className}`} aria-hidden="true" />
}
