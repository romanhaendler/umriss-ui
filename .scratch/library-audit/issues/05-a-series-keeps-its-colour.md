# 05 — A series keeps its colour

Status: done

Spec: `.scratch/library-audit/spec.md`

## Scope

`packages/charts/src/scene.ts`, `Chart.tsx`, `theme.ts`, `CONTEXT.md`
(**Registration order**), and one conformance test in `packages/ui`.

- **The palette follows the name.** `registerSeries` (`scene.ts:463`)
  assigns `nextRegistration++`, and `farbeFuer` (`scene.ts:1122`) colours by
  the entry's index in `seriesInOrder()`. A series that unmounts and mounts
  again lands at the end and shifts every colour. Verified with a throwaway
  vitest file: register A, B, C → blue, pink, green; unregister A, register A
  → B blue, C pink, A green.
  The scene keeps a `Map<string, number>` from series name to palette slot,
  filled on first registration, consulted on every later one, never shrunk
  while the scene lives. A nameless series keeps today's index rule and gets a
  DEV `warnOnce` on remount. Draw order stays registration order.
  `CONTEXT.md` **Registration order** is corrected: it decides the drawing;
  the palette is decided by name, with JSX order as the initial assignment.
- **The legend leaves the image.** `Chart.tsx:160-166` puts `role="img"` and
  `aria-label` on the root that also contains `{children}`, i.e. the legend
  with its hover highlight. Descendants of `role="img"` are presentational.
  The role and label move to `.kc-plot`; the root becomes a plain container.
- **`FALLBACK_THEME` is checked, not trusted.** `theme.ts:30-41` carries
  `#8a5c00`, `#b13636`, `#217a4b`, `#71717a`, `#ffffff` — a second copy of
  `tokens.css`. A conformance test in `packages/ui/tests-unit/` reads
  `tokens.css` via `?raw` and asserts the fallback equals the light-theme
  token for each of the six named colours. Direction: ui reads charts; charts
  imports nothing from ui (R-1.2). When `tone-contrast` moves the danger
  colour, this test is what fails.

## Acceptance

- `scene.test.ts`: three series registered, the first unregistered and
  re-registered by name → `legendItems()` colours unchanged; the nameless
  variant → colours shift as before and the warning fires once.
- `mount.jsdom.test.tsx`: the element with `role="img"` is `.kc-plot`, and the
  legend is not a descendant of it.
- `packages/ui/tests-unit/themeFallbackKonformitaet.test.ts` as above.
- `STATUS.md` rows "Registrierungsreihenfolge = Zeichen-/Palettenreihenfolge"
  and "Palette `--uc-series-N` nach Reihenfolge" are reworded to the new rule.
- No charts baseline moves: the demo mounts its series once.

## Comments

**11 Sep 2026 — delivered.**

- The conformance test found the three copies agree except one:
  `FALLBACK_THEME.colorText` and the `charts.css` literal are `#71717a`, the
  token `--u-color-text-muted` is `#8b8b8b`. It is a named exception, not
  aligned: the token measures about 3.4:1 on white, the fallback 4.8:1, the
  charts demo draws with the fallback, and `tone-contrast` explicitly leaves the
  token out.
- A nameless series warns when its colour actually shifts, not on every
  remount: StrictMode registers every series twice in DEV.

Review follow-up: a rename left the old name mapped to the slot, so a
new series under the old name took the renamed series' colour. The scene now
refuses a slot that a named series currently holds.
