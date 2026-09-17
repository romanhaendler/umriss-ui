# 07 — Tokens the components stopped reading

Status: done

Spec: `.scratch/library-audit/spec.md`

Overlaps: `.scratch/tone-contrast/spec.md` (the danger text token) and the
unmerged `visuelle-wertigkeit` (motion vocabulary, vocabulary test). This
ticket takes only what is a defect today and leaves the vocabulary work to
them.

## Scope

Stylesheets and the few TSX files that mirror them. All read; the counts
come from the stylesheet review.

- **`Modal.module.css:52`** — `background: rgba(12, 12, 14, 0.45)`.
  `--u-color-scrim` exists (`tokens.css:190`, dark `244`) and
  `CommandPalette.module.css:19` uses it. Modal uses it. *Baseline moves:*
  the modal page in the dark theme, reviewed.
- **`Button.module.css:59,65`** — `color: #ffffff` and `color-mix(…, #000000)`
  on the danger variant. New `--u-color-on-danger` in both themes, analogous
  to `--u-color-on-accent`; the hover mix uses a token too. This is the
  surface half of the pair `tone-contrast` lists under `OFFEN`
  (`barrierefreiheit.spec.ts:96-99`): land together, or the contrast test
  names the tolerated pair until it does. *Baseline moves:* the button page
  in the dark theme, reviewed.
- **Durations written twice.** `Modal.tsx:47` (`160`) vs
  `Modal.module.css:61,69` (`160ms`); `Toast.tsx:54` (`EXIT_DAUER = 210`) vs
  `Toast.module.css:47-48` (`200ms`). `dauerAus` moves from `Dock.tsx:155` to
  `lib/motion.ts`; both components read their exit duration from a token via
  computed style; the literals go. New tokens `--u-duration-exit-*` only if
  `visuelle-wertigkeit` has not landed its motion set first — coordinate.
- **`MultiSelect.tsx:230`** — `const ABSTAND = 8; /* var(--u-space-2) */`.
  Read `column-gap` from the computed style of the container, as the Dock
  reads its gap.
- **`Button.module.css:21,25-27`** — `transform 80ms ease-out` with
  `scale(0.98)` and no reduce block. Add the block every other module with a
  raw duration has.
- **Density is dead.** `lib/anbieter/index.tsx:27,45,65` define `Dichte` and
  `useDichte`; nothing reads them. `useThemaAmDokument` also writes
  `data-dichte`; `Table` and `AlarmList` default their `density` prop from
  `useDichte()` ("comfortable" → "regular"). No compact token set — that is
  B.13. Just the wiring, so the setting is not a lie.
- **Focus and hover drift.** The hover edge
  `color-mix(in srgb, var(--u-color-text) 30%, transparent)` appears seven
  times (`Input:20`, `Select:24`, `Combobox:26`, `DatePicker:21`,
  `MultiSelect:21`, `NumberInput:15`, `Button:79`) and `Textarea:27` /
  `RadioGroup:79` use `--u-color-text-muted` instead. One token
  `--u-color-edge-hover`, nine users. `Textarea.module.css:26,30` uses
  `:focus`/`:not(:focus)`; every sibling uses `:focus-visible`. Align.
- **Namespace.** `DatePicker.module.css:75` `--u-kalender-monat` and
  `Divider.module.css:5,10` `--u-divider-farbe` are module-local properties
  named like tokens. Rename to `--_…` as `Modal` does.

Left to `visuelle-wertigkeit`: the ten off-scale font sizes, the tracking
literals, the duplicated keyframes, the exit easing token, the glyph strokes.

## Acceptance

- `kontrast.test.ts` gains the `on-danger` pairs at 4.5:1 in both themes.
- A stylesheet text test over `components/**/*.module.css`: no `#` or
  `rgba(` literal; no `ms` literal outside a `prefers-reduced-motion` block
  except a named exception list (Checkbox 320ms, Spinner, Skeleton).
- `anbieter.test.tsx`: a provider with `dichte="compact"` writes
  `data-dichte`; a `Table` under it renders compact; without a provider it
  renders regular.
- Behaviour test: a `Toast` dismissed with reduced motion is removed at once;
  without it, after the token's duration read from the stylesheet — the
  test reads the same token, so there is one number.
- Exactly two screenshot baselines move — modal dark, button dark — and the
  Playwright report is attached to the delivery note with both diffs
  described.

## Comments

**11 Sep 2026 — delivered.**

- Exactly two baselines moved, but not the two named: `button--varianten` and
  `confirmdialog--rueckfrage`, both dark. The ConfirmDialog trigger is a danger
  button; the modal backdrop moved nothing, because no screenshot shows an open
  modal. Both images were compared by eye: only the label colour of the danger
  button changed. Playwright before regeneration: 431 passed, 2 failed; after:
  433 passed.
- `--u-color-on-danger` is `#2b0f0d` in the dark theme (4.84:1 on
  `#d0655c`), turning polarity like `--u-color-on-accent`; its `OFFEN` entry is
  struck. `--u-color-danger-active` darkens in light and lightens in dark.
- The allowed raw durations are six, not three: Checkbox's 60ms delay, the
  table's own 1.6s shimmer and Button's 80ms press were added, each with a
  reason. Button got its reduce block.
- Exit tokens are `--u-duration-exit` (Modal) and `--u-duration-exit-collapse`
  (Toast); `visuelle-wertigkeit` had not named any.
- Density: the provider context records whether a density was set
  (`lib/anbieter/kontext.ts`, internal), so `AlarmList`, compact by itself, is
  not pulled to regular by a provider that says nothing.
