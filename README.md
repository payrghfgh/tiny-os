# TinyOS

A pretend operating system for toddlers and young kids, built for an iPad but happy on any
touch screen. It opens like a little computer: a colourful home screen with big app tiles, a
clock in the corner, and eight apps your little one can poke at without ever getting lost,
breaking anything, or reaching the internet.

No accounts, no ads, no links out, no analytics, no network requests at all. Everything runs in
the browser tab, including the sound.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (http://localhost:5173). `npm run dev` also passes `--host`, so you
can open the same address from the iPad on the same Wi-Fi using your laptop's local IP.

Other scripts:

```bash
npm run build     # type-check with tsc, then build to dist/
npm run preview   # serve the production build locally
```

## Put it on the iPad

1. Run `npm run build`.
2. Host the `dist/` folder anywhere static (Netlify, Vercel, GitHub Pages, an S3 bucket).
3. Open the site in Safari on the iPad.
4. Share → **Add to Home Screen**. It then launches fullscreen with no browser chrome, like a real
   app, using the web manifest in `public/manifest.webmanifest`.

Turn on **Guided Access** (Settings → Accessibility → Guided Access) if you want the child locked
into the app with no way out to the rest of the iPad.

## The apps

| App | What happens |
| --- | --- |
| **Bubbles** | Bubbles float up; tap one and it pops with a burst of colour and a little sound. |
| **Paint** | Finger painting with a rainbow brush, eight colours, a brush-size toggle and a sponge to clear. |
| **Music** | An eight-bar xylophone on a pentatonic scale, so any order of taps sounds nice. |
| **Animals** | Nine flip cards hiding animals. Turning one over speaks its name and the noise it makes. |
| **Shapes** | Tap anywhere and a random shape blooms and pops in. Tap a shape to pop it. |
| **Stars** | A calm night sky: tap to hang a twinkling star, chime by chime. |
| **Counting** | Counts 1 to 10 out loud, adding one fruit per tap, with a confetti party at ten. |
| **Spinny** | A colour wheel that spins and ticks like a fidget toy. |

## Design rules the code follows

- **Nothing is smaller than a fingertip.** Every tappable thing is at least 46px, most are far bigger.
- **No reading required.** Each app is discoverable from its icon and its colour; words are decoration.
- **No dead ends.** The round 🏠 button in the top-left of every app always returns home, and it is
  always in the same place.
- **No accidental zoom or scroll.** Pinch-zoom, double-tap zoom, text selection and long-press menus
  are all disabled, and the layout is locked to the viewport.
- **Sound is synthesised, not downloaded.** The Web Audio engine in `src/os/audio.ts` generates every
  beep, pop and chime, so there are no audio files to load and it works offline.
- **Sound can be switched off** by a grown-up: press and hold the clock for a second.
- **Reduced motion is respected** through `prefers-reduced-motion`.

## Project layout

```
src/
  main.tsx            entry point
  App.tsx             the OS shell: home screen, status bar, app windows, grown-up sheet
  styles.css          all styling, in one file, no CSS framework
  os/
    audio.ts          Web Audio sound engine + speech helper
  apps/
    registry.tsx      the list of apps shown on the home screen
    Bubbles.tsx  Paint.tsx  Music.tsx  Animals.tsx
    Shapes.tsx   Stars.tsx  Count.tsx  Spinny.tsx
public/
  manifest.webmanifest, icon.svg
```

## Adding another app

1. Create `src/apps/MyApp.tsx` — a component that fills its container. Give it the `stage` class for
   the standard white rounded card.
2. Import it in `src/apps/registry.tsx` and add one entry: `{ id, label, emoji, from, to, App }`.
   The home screen picks it up automatically.

## Notes

- No environment variables are needed. `.env.example` documents that fact.
- Built with React + Vite + TypeScript. Plain CSS rather than a utility framework because most of the
  styling here is bespoke keyframe animation.
- Tested at 375px wide and at iPad landscape/portrait sizes.
