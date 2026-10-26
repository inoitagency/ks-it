# KS School Website

Next.js site for KS School of Business Management & Information Technology.

Official school imagery is stored in `public/images/official`, with source URLs
in `sources.json` and shared paths in `src/content/official-media.ts`.
See [production readiness](docs/production-readiness.md) for the remaining release blockers.

## Local development

```bash
npm install
npm run dev
```

The outer download folder also forwards `npm run dev`, `build`, and `start` to
the inner project. Development uses Webpack to avoid the nested-folder Tailwind
resolution loop in Turbopack. Tailwind scans only `src`; project roots are
anchored to configuration files. Webpack memory optimization is enabled and
build worker concurrency is limited to two. None of these settings changes the UI.

## Production build

```bash
npm run build
npm run start
```

Use the production build to assess loading and scrolling performance. `npm run dev`
also compiles pages and serves development tooling, which adds CPU and memory use.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

With the production server running, run the browser checks:

```bash
node scripts/browser-smoke.cjs http://127.0.0.1:3000
```

Use `node scripts/browser-smoke.cjs http://127.0.0.1:3000 --footer-only`
for curtain reveal, reverse scrolling, short windows and resize checks.

This uses installed Chrome or Edge on Windows (or the executable in `CHROME_PATH`)
and Node 22 or later. It checks desktop/mobile layouts, breakpoint changes,
video pause/resume, gallery interactions, the cursor, detail routes, and runtime
exceptions. Screenshots are saved in the ignored `.browser-check` directory.

## Animation and performance structure

- `smooth-scroll.tsx` owns Lenis and drives it from GSAP's clock with the original
  scroll smoothing. It removes its ticker callback when the page unmounts.
- `use-media-query.ts` and `responsive-layout.tsx` preserve server-rendered content
  and mount only the active layout after hydration. Gallery and leadership scenes
  revert and rebuild their GSAP contexts when the breakpoint changes.
- Pointer previews use MotionValues and transform positioning, without React
  state updates on pointer movement. The custom cursor also uses transforms.
- `use-visible-video.ts` pauses the hero video outside the viewport or in a hidden
  tab, then resumes it without resetting playback. The original video is preserved.
- Below-the-fold images load lazily and decode asynchronously. The intro owns its
  state independently and plays once per browser tab/session.
- `use-scene-images.ts` warms gallery and leadership images within 1200px of the
  viewport, so their initial off-screen animation positions do not delay loading.
- Marquee cloning is bounded, waits for hidden containers to gain width, responds
  to resizing, and cleans up only its own animations and generated elements.
- The curtain footer measures its content height and reveals with a scroll-driven
  transform. It keeps the page's normal flow without a fixed-height spacer,
  viewport-fixed layer or nested scroller. Tall footers finish revealing before
  normal scrolling exposes the remaining links.

The desktop hero, gallery and leadership scenes retain their animation
choreography. Mobile leadership photos reserve their height and reveal with the
name. Distinct official school photographs replace stock/repeated section
images. Type errors fail the production build.

The final homepage section is `campus-experience.tsx`: three buttons select a
photo preview through pointer hover, click, keyboard focus or touch. It uses
normal vertical page flow and stacks on smaller screens. The former horizontal
slider and its unused seminar/event components have been removed. Its tabs also
rotate every five seconds while visible; manual selection restarts that timer.

## Verified content and backend behavior

See `docs/content-audit.md` for official sources and remaining verification limits.
`src/content/school.ts` owns shared school contacts, eligibility and leadership.
Set the server-only `SCHOOL_API_URL` to override the existing backend origin.
Requests time out after 20 seconds. Unavailable services return failures rather
than sample records, and client requests cancel on navigation.

Run `node scripts/api-smoke.cjs` for isolated upstream failure and contact
validation checks. No real contact messages are sent by these tests. Live message
delivery and current backend data still need verification before launch.

## Push to GitHub

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Deploy to Vercel

1. Import the GitHub repository in Vercel.
2. Keep the detected framework as `Next.js`.
3. Leave the build command as `next build`.
4. Leave the output setting empty so Vercel uses the default Next.js runtime.
5. Deploy.

No extra `vercel.json` is required for the current setup.
