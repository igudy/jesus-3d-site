import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { begin, chapters, prayer } from '../data/content'
import { Anchor, Btn, Reveal, SplitText } from './primitives'

const ease = [0.2, 0.7, 0.2, 1]

/* Giant word behind the relic: slides sideways as you scroll through its section (GSAP scrub) */
function Mega({ text, size }) {
  const ref = useRef()
  useGSAP(() => {
    // GSAP moves the wrapper; Framer Motion animates the word inside it, so they never fight over transform
    gsap.fromTo(ref.current, { xPercent: 7 }, {
      xPercent: -7, ease: 'none',
      scrollTrigger: { trigger: ref.current.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  })
  return (
    <div className="mega-wrap" ref={ref} aria-hidden="true">
      <motion.div className="mega" style={{ '--fs': size }}
                  initial={{ opacity: 0, y: '14%' }} whileInView={{ opacity: 1, y: '0%' }}
                  viewport={{ once: true, amount: 0.4 }} transition={{ duration: 1.4, ease }}>
        {text}
      </motion.div>
    </div>
  )
}

/* Scripture card that drifts against the scroll */
function Verse({ text, refText }) {
  const ref = useRef()
  useGSAP(() => {
    gsap.fromTo(ref.current, { yPercent: 12 }, {
      yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: ref.current.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  })
  return (
    <figure className="verse" ref={ref}>
      <Reveal>
        <blockquote>“{text}”</blockquote>
        <figcaption>{refText} · KJV</figcaption>
      </Reveal>
    </figure>
  )
}

export function Hero() {
  return (
    <section id="top" data-world="air" data-stage="off">
      <Anchor type="halo" className="a-halo" />
      <div className="shadow hero-copy">
        <Reveal as="span" className="chip">The greatest story ever told</Reveal>
        <SplitText as="h1" text="Jesus." className="hero-title" delay={0.3} stagger={0.07} />
        <Reveal as="p" className="kicker" delay={0.7}><em>And the Word was made flesh, and dwelt among us.</em></Reveal>
        <Reveal as="p" className="lede" delay={0.85}>From a manger in Bethlehem to an empty tomb: the birth, life, death and resurrection of Jesus Christ.</Reveal>
        <Reveal className="actions" delay={1}>
          <Btn href="#birth">Begin the story</Btn>
          <Btn href="#resurrection" tone="ghost">He is risen</Btn>
        </Reveal>
      </div>
      <Reveal className="scroll-cue" delay={1.4}><span>Scroll</span><i /></Reveal>
      <Mega text="Jesus" size="22vw" />
    </section>
  )
}

export function Chapter(c) {
  return (
    <section id={c.id} data-world={c.world} data-stage={c.stage} className="chapter">
      {c.halo && <Anchor type="halo" z={-2} className="a-halo-rise" />}
      {c.clouds && <><Anchor type="cloud" z={-3} className="a-cloud1" /><Anchor type="cloud" z={1} className="a-cloud2" /></>}
      <div className={`side ${c.side === 'right' ? 'right' : ''}`}>
        <Reveal as="span" className="label">{c.label}</Reveal>
        <h2 className="big">
          <SplitText text={c.title[0]} />{' '}
          <em><SplitText text={c.title[1]} delay={0.15} /></em>
        </h2>
        <Reveal as="p" className="cat" delay={0.1}>{c.cat}</Reveal>
        <Reveal as="p" className="lede" delay={0.2}>{c.body}</Reveal>
        <motion.ul className="pillars" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
                   transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}>
          {c.moments.map(([b, s]) => (
            <motion.li key={b} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}>
              <b>{b}</b><small>{s}</small>
            </motion.li>
          ))}
        </motion.ul>
      </div>
      <Verse text={c.verse.text} refText={c.verse.ref} />
      <Mega text={c.mega} size={c.megaSize} />
    </section>
  )
}

/* The Way: the four chapters as cards */
export function Way() {
  return (
    <section id="way" data-world="air" data-stage="off">
      <Anchor type="cloud" z={-2} className="a-cloud3" />
      <Reveal as="span" className="chip">The way</Reveal>
      <h2 className="shadow"><SplitText text="The way, the truth," /> <em><SplitText text="and the life." delay={0.2} /></em></h2>
      <Reveal as="p" className="lede" delay={0.2}>Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me. (John 14:6)</Reveal>
      <motion.div className="way-grid" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} transition={{ staggerChildren: 0.1 }}>
        {chapters.map((c) => (
          <motion.a key={c.id} href={`#${c.id}`} className={`way-card w-${c.world}`}
                    variants={{ hidden: { opacity: 0, y: 40, rotateX: 14 }, show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.9, ease } } }}
                    whileHover={{ y: -8 }}>
            <span className="num">{c.numeral}</span>
            <h3>{c.title.join(' ')}</h3>
            <p>{c.verse.ref}</p>
            <span className="go">Revisit →</span>
          </motion.a>
        ))}
      </motion.div>
    </section>
  )
}

export function Word() {
  return (
    <section id="word" data-world="air" data-stage="off">
      <Anchor type="gyro" z={-1} className="a-gyro" />
      <Reveal as="span" className="chip word-chip">The heart of it</Reveal>
      <Reveal as="blockquote" className="shadow" delay={0.1}>For God so loved the world, that he gave his only begotten Son, <em>that whosoever believeth in him should not perish, but have everlasting life.</em></Reveal>
      <Reveal as="cite" delay={0.2}>John 3:16</Reveal>
    </section>
  )
}

export function Begin() {
  const [showPrayer, setShowPrayer] = useState(false)
  return (
    <section id="begin" data-world="air" data-stage="off">
      <Reveal as="span" className="chip">Begin</Reveal>
      <h2 className="shadow"><SplitText text="Your story" /> <em><SplitText text="starts here." delay={0.2} /></em></h2>
      <div className="cards">
        {begin.map((b, i) => (
          <Reveal key={b.tag} className="card" delay={i * 0.1}>
            <span className="chip">{b.tag}</span>
            <h3>{b.title}</h3>
            <p>{b.body}</p>
            {b.prayer
              ? <button className="btn" onClick={() => setShowPrayer((v) => !v)}>{showPrayer ? 'Close' : b.cta} <span className="arr">{showPrayer ? '×' : '→'}</span></button>
              : <Btn href={b.href}>{b.cta}</Btn>}
          </Reveal>
        ))}
      </div>
      <AnimatePresence>
        {showPrayer && (
          <motion.blockquote className="prayer" initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                             exit={{ opacity: 0, y: 10, height: 0 }} transition={{ duration: 0.6, ease }}>
            {prayer}
          </motion.blockquote>
        )}
      </AnimatePresence>
    </section>
  )
}

export function Footer() {
  return (
    <footer>
      <span>He is risen ✦ Matthew 28:6</span>
      <span>Scripture quotations from the King James Version</span>
    </footer>
  )
}
