import { lazy, Suspense } from 'react'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useActiveSection } from './hooks/useActiveSection'
import { chapters } from './data/content'
import { Nav, Rail, Progress, GridLines } from './components/Chrome'
import { Hero, Chapter, Way, Word, Begin, Footer } from './components/Sections'
import Worlds from './components/Worlds'

const Scene = lazy(() => import('./three/Scene'))
const Stage = lazy(() => import('./components/Stage'))
const chapterIds = new Set(chapters.map((c) => c.id))

export default function App() {
  useSmoothScroll()
  const active = useActiveSection()

  return (
    <>
      <Suspense fallback={null}><Scene /></Suspense>
      <Worlds />
      <Suspense fallback={null}><Stage world={active.world}
       chapter={chapterIds.has(active.id) ? active.id : null} />
       </Suspense>
      <GridLines />
      <Nav />
      <Rail active={active.id} />
      <Progress />
      <main>
        <Hero />
        {chapters.map((c) => <Chapter key={c.id} {...c} />)}
        <Way />
        <Word />
        <Begin />
      </main>
      <Footer />
    </>
  )
}
