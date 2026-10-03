import { useSyncExternalStore } from 'react'

// DOM boxes that 3D objects pin themselves to. Put <Anchor type="cloud" className="a-cloud1" />
// in a section and position it with CSS; the 3D object follows that box.
let anchors = []
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

export function registerAnchor(a) {
  anchors = [...anchors, a]
  emit()
  return () => { anchors = anchors.filter((x) => x !== a); emit() }
}

export function useAnchors() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => anchors)
}

export const D = 14 // camera distance to the z = 0 plane

// World units per CSS pixel at z = 0, so objects at z = 0 scroll exactly with the page.
export const unitsPerPx = (fov) => (2 * D * Math.tan((fov * Math.PI) / 360)) / innerHeight

export function measure(el, z, fov) {
  const k = unitsPerPx(fov)
  const r = el.getBoundingClientRect()
  const f = (D - z) / D // keep objects at z != 0 visually on their box
  return {
    x: (r.left + r.width / 2 - innerWidth / 2) * k * f,
    y: -(r.top + scrollY + r.height / 2) * k,
    z,
    w: r.width * k * f,
    h: r.height * k * f,
  }
}
