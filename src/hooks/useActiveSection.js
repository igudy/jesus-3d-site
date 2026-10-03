import { useLayoutEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// The section crossing the middle of the screen decides the world, the relic and the rail.
export function useActiveSection() {
  const [active, setActive] = useState({ id: 'top', world: 'air', stage: 'off' })

  useLayoutEffect(() => {
    const triggers = [...document.querySelectorAll('main section[data-world]')].map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => self.isActive && setActive({ id: el.id, world: el.dataset.world, stage: el.dataset.stage }),
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  useLayoutEffect(() => { document.body.dataset.world = active.world }, [active.world])

  return active
}
