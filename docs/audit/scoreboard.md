# Spaghetti scoreboard history

Produced by `docs/audit/_work/scratch/scoreboard.mjs --record`. Every number should only go down.

- **m1** — Motion timing hardcoded (duration-N, ease-*, cubic-bezier, Nms) outside tokens.css (target 0)
- **m2** — Arbitrary px/rem values in classNames ([13px]) (target 0)
- **m3** — Tailwind numeric spacing instead of the DS scale (p-2, gap-4…) (target 0)
- **m4** — Raw var(--ui-*) inside className brackets (target 0)
- **m5** — Hand-rolled focus rings (shadow-focus / ring utilities) (target 0)
- **m6** — Hand-rolled disabled looks (disabled:opacity, opacity-50, disabled:cursor) (target 0)
- **m7** — "use client" files (keep as few as possible) (minimise)
- **m8** — JS timers/animation loops in components (rAF, setTimeout, setInterval) (minimise)
- **m9** — Value callbacks not named onValueChange (onChange(value)/onSelect) (target 0)
- **m10** — Vestigial default exports in component modules (target 0)

| date | HEAD | m1 | m2 | m3 | m4 | m5 | m6 | m7 | m8 | m9 | m10 | note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-10-01 | b436647 (audited) | 102 | 19 | 36 | 5 | 3 | 2 | 40 | 8 | 7 | 74 | baseline at the audit |
| 2026-10-03 | b436647+dirty | 102 | 19 | 36 | 5 | 3 | 2 | 40 | 8 | 7 | 74 | after spacing rename + 6 fixes (2026-10-02/03) |
| 2026-10-03 | b436647+dirty | 102 | 19 | 36 | 5 | 3 | 2 | 40 | 8 | 7 | 74 | after size-words/heights/ghost pass |

Note 2026-10-03: m1 originally skipped dooph-component-tokens.css (a filename-match bug); the earlier rows were corrected from 90 to 102 by re-measuring b436647.
| 2026-10-03 | b436647+dirty | 0 | 19 | 36 | 5 | 3 | 2 | 40 | 8 | 7 | 74 | batch 01 motion scale |
| 2026-10-03 | b436647+dirty | 0 | 19 | 36 | 5 | 3 | 2 | 40 | 8 | 0 | 74 | batches 02+03: callbacks, guards, renames, colour lookup, public surface |
| 2026-10-03 | b436647+dirty | 0 | 19 | 36 | 5 | 3 | 2 | 28 | 8 | 0 | 74 | batch 04 use client |
| 2026-10-03 | b436647+dirty | 0 | 18 | 36 | 5 | 3 | 2 | 28 | 6 | 0 | 74 | batch 05 new components |
| 2026-10-03 | b436647+dirty | 0 | 18 | 36 | 5 | 3 | 2 | 28 | 5 | 0 | 0 | wave A |
| 2026-10-03 | b436647+dirty | 0 | 18 | 36 | 5 | 3 | 2 | 28 | 5 | 0 | 0 | wave B |

Note 2026-10-04: m3 no longer counts zero resets (`p-0`, `m-0`). Zero is not a spacing value and has no DS token. Re-measured at b436647 with the new rule: see the line below.
- b436647 m3 under the new rule = 28 (was 36 when zeros were counted).
| 2026-10-04 | b436647+dirty | 0 | 0 | 0 | 5 | 3 | 2 | 27 | 5 | 0 | 0 | wave C (m3 rule now excludes zero resets) |
- 2026-10-04: m6 no longer counts `disabled:opacity-100` (a reset that cancels a double fade, not a disabled look). b436647 m6 under the new rule = 0.
| 2026-10-04 | b436647+dirty | 0 | 0 | 0 | 5 | 0 | 0 | 27 | 5 | 0 | 0 | wave D (m6 rule excludes disabled:opacity-100 resets) |
| 2026-10-04 | b436647+dirty | 0 | 0 | 0 | 5 | 0 | 0 | 27 | 5 | 0 | 0 | wave E |
| 2026-10-04 | b436647+dirty | 0 | 0 | 0 | 0 | 0 | 0 | 27 | 5 | 0 | 0 | wave F — overnight run complete |
| 2026-10-04 | b436647+dirty | 0 | 0 | 0 | 0 | 0 | 0 | 27 | 5 | 0 | 0 | review round 1 |
| 2026-10-04 | b436647+dirty | 0 | 0 | 0 | 0 | 0 | 0 | 27 | 5 | 0 | 0 | review round 2 |
| 2026-10-04 | b436647+dirty | 0 | 0 | 0 | 0 | 0 | 0 | 27 | 5 | 0 | 0 | review round 3 |
| 2026-10-07 | b436647+dirty | 0 | 0 | 0 | 0 | 0 | 0 | 27 | 5 | 0 | 0 | review round 4: expression system, PI gap, CTA tilt |
