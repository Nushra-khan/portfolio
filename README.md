# A Little World of My Own

A cinematic, scroll-driven 3D portfolio: walk up a garden path, ring the bell, and wander through a cottage — study → workshop → library → kitchen — before stepping back out into the garden at night.

Every model (cottage, trees, flowers, books, food, steam) is generated in code, so there are no external assets to download or license.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

Requires Node 18.18+ (Node 20 or 22 recommended).

## Make it yours

| What | Where |
| --- | --- |
| Name, tagline, email, socials | `content/site.ts` → `site` |
| About text | `content/site.ts` → `about` |
| Projects (GitHub + demo links) | `content/site.ts` → `projects` |
| Papers, awards, talks | `content/site.ts` → `research` (each becomes a book on the library table) |
| Recipes | `content/site.ts` → `recipes` (ids map to the 3D dishes) |
| Résumé | replace `public/resume.pdf` |
| Static fallback images | `public/stills/*.jpg` (one per section) |

## How it works

- **One continuous camera journey.** `lib/journey.ts` holds the camera keyframes. Page scroll maps to a journey value `g` (0 = garden, 5 = night garden). Each section has a *hold* range, where its panel is pinned and the camera drifts slightly, and a *transition* range, where the camera walks through a doorway to the next room.
- **Door transitions.** The interiors are built below the ground. When the camera passes through the front door or the kitchen's back door, a warm light-bloom hides the jump.
- **Smooth scrolling.** Lenis drives the scroll and GSAP ScrollTrigger handles the reveals and the sideways project track. Nothing is scroll-jacked or snapped: the native scrollbar, the keyboard, anchor links and the nav all work.
- **Interactions.** Ring the doorbell, hover the laptop, the robot, the research books and the dishes, and click the mailbox. Hovering a card in a panel also highlights its 3D object.

## Performance and accessibility

- **Quality tiers**, detected automatically:
  - `high`: shadows, depth of field, bloom.
  - `low`: on phones and tablets. No post-processing, fewer instances.
  - `lite`: static pre-rendered stills, no WebGL.
  - The **3D/Simple** toggle in the nav overrides the tier, and the choice is saved. You can also force one with `?quality=high|low|lite`.
- An adaptive pixel ratio and a performance monitor step quality down if the frame rate drops.
- **`prefers-reduced-motion`**: smooth scrolling is turned off, and the camera cuts between rooms with a soft fade instead of flying. Foliage sway and parallax stop.
- Sections are real, semantic HTML, so screen readers and search engines get the full content. The canvas is decorative (`aria-hidden`).

## Stack

Next.js 15 (App Router) · React 19 · React Three Fiber 9 · drei · @react-three/postprocessing · Three.js · GSAP ScrollTrigger · Lenis · Tailwind CSS · Fraunces + Inter (self-hosted via Fontsource).
