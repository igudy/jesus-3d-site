# Jesus — The Story (3D site)

React + Vite · Framer Motion (`motion`) · GSAP ScrollTrigger · Lenis · React Three Fiber.
Scripture quoted from the King James Version (public domain).

```bash
npm install
npm run dev
npm run build    # dist/ → deploy to Vercel / Netlify
```

## The four chapters
| Chapter | World | 3D relic (built-in) | Drop a model here to replace it |
|---|---|---|---|
| I · Birth | Night sky, Star of Bethlehem | Four-point star | `public/models/birth.glb` |
| II · Life | Gold, turning rays | Ichthys fish | `public/models/life.glb` |
| III · Death | Crimson, rising embers | Cross with crown of thorns | `public/models/death.glb` |
| IV · Resurrection | Sky, halo, chrome clouds | The stone rolled away | `public/models/resurrection.glb` |

Any `.glb` you drop in is auto-centred, scaled, given the world's metal (silver / gold / blood-red / white)
and spun in when its chapter arrives. To keep a model's own textures, pass `keepMaterials` to `<GLB>` in `src/components/Stage.jsx`.

## Where things live
| File | What |
|---|---|
| `src/data/content.js` | All copy, verses, chapter order, worlds |
| `src/components/Sections.jsx` | Hero, chapters, The Way, John 3:16, Begin |
| `src/components/Stage.jsx` | The 3D relic stage + per-world metal |
| `src/three/Relics.jsx` | Built-in star / fish / cross / stone |
| `src/components/Worlds.jsx` | Night / gold / crimson backgrounds and diagonal wipes |
| `src/three/Scene.jsx` | Sky: halo rings, chrome clouds, gyroscope |
