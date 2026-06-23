# How Remotion performed — a note for the standardisation decision

W12 goal (a) was to genuinely test Remotion as the video tool and report how it
felt, so you can decide whether to standardise on it for lesson and marketing
video. This is that report, written from actually building the explainer end to
end in the FDE register.

## Verdict

**Standardise on it for marketing and explainer video. Strong yes.** It is the
right tool for short, typography-led, brand-consistent video where the content
changes often. Reservations are about heavier lesson video (long, asset-rich,
many edits), where the render-time and preview-iteration costs grow.

## What worked well

- **Design tokens map directly.** Because slides are React + CSS-in-JS, the FDE
  palette became one `fde-theme.ts` and every slide reads `FDE.*`. The video and
  the website literally share the same hex values and type scale. No other video
  tool gives you "no raw hex, tokens only" as a lint-able guarantee.
- **Props-driven templates are real components.** The five slide types are typed
  React components with `motionVariant` unions. Changing all copy and timing
  happens in one data file (`explainer-content.ts`); the visuals never move. This
  is exactly the "reusable library, not a one-off timeline" outcome we wanted,
  and it falls out of the architecture for free.
- **Motion is restrained by default when you want it to be.** The register asks
  for fades, hairline draws, and mask wipes — all trivial with `interpolate` +
  one easing. No fighting a timeline UI to remove flourishes.
- **Text rendering is excellent.** Source Serif 4 + JetBrains Mono via
  `@remotion/google-fonts` rendered crisply at 1080p with the italic-`em` accent
  intact. `text-wrap: balance` and CSS measures handle long copy gracefully.
- **Stills are a fast feedback loop.** `remotion still ... --frame=N` renders one
  frame in a couple of seconds and was how every slide was verified here without
  watching a full render.
- **Audio sync is just data.** Generating the VO first, measuring each chunk, and
  setting beat `seconds` to match gave frame-accurate sync with zero manual
  nudging. A 65s track lined up to the second on the first try.
- **Versionable and reviewable.** The whole video is text in git. Diffs are
  meaningful, review reels are just more compositions, and a teammate can
  re-render deterministically.

## Friction / costs

- **Render time is CPU-bound and serial-ish.** The 65s 1080p cut took a few
  minutes per render on this box; the GPU is not the bottleneck (Chromium is).
  For a library of long lesson videos this adds up — budget a render farm or
  off-peak batch renders if standardising there.
- **Two React trees.** Remotion 4 wants React 18; the Next app is on React 19.
  Keeping the video as its own project root (own `node_modules`) was the clean
  fix, but it means the slide library is not literally imported by the site — it
  is a sibling that shares tokens by convention, not by package.
- **No timeline GUI for non-engineers.** Editing is code, not drag-and-drop.
  Great for us, a wall for a non-technical content editor. The data-file pattern
  (`explainer-content.ts`) softens this: copy edits are obvious even to a
  non-coder, but adding a new beat type is an engineering task.
- **Font/asset bundling needs care.** Fonts must be loaded via the Remotion font
  packages (not `next/font`) and audio must sit in the project's `public/` for
  `staticFile`. Minor, but a different mental model from the Next app.

## Recommendation for the curriculum/lesson decision

- **Marketing + explainers (this kind):** adopt Remotion as the standard. The
  token-sharing, reusable-template, git-reviewable story is exactly right and the
  render cost is small at this length.
- **Lesson video (long, frequent, asset-heavy):** pilot before committing. The
  template library transfers, but validate batch render throughput and whether
  content authors can drive the data files without engineering help. The existing
  `/home/david/remotion-project` already proves the lesson register works; the
  open question is operational scale, not capability.
