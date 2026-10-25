# 01 - The mode keeps a widget's body at its height

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/scroll-in-a-widget/spec.md`

## What to build

The prefactor. Today the editing mode takes about 6 px from every widget's body, through the head band's
extra padding and the body's larger top padding in the mode. Content that fits at rest is cut further on
"Edit" (`.scratch/shakedown/dashboard.md` 6: a `Stat` is cut by 15 px at rest and by 21 px in the mode).
Once the body scrolls (ticket 02), the same gap would make a scrollbar appear and the content reflow on
"Edit".

- **The body keeps its height.** In the mode, a widget's body is exactly as tall and as wide as at rest, at
  every size, in the grid and in the list form.
- **The band keeps its look.** It is still the sunken band, with the grip, the title, the size label and the
  menu. The room it needs comes from the head, not from the body. Compare the mode's screenshots with the
  old ones by eye before renewing them.
- **The check.** A `@quick` check in the dashboard's visual suite measures every widget body of the
  dispatcher example at rest and after "Edit", at 1280 px and at 390 px. Each body has the same height and
  width in both.

## Acceptance criteria

- [ ] In the dispatcher example, every widget body has the same height and width before and after "Edit",
      at 1280 px and at 390 px, held by the new `@quick` check.
- [ ] The check fails against today's stylesheet.
- [ ] The mode's screenshots are renewed, and the band, its grip, title, size label and menu look as before.
- [ ] `pnpm check dashboard` and `pnpm test:visual:quick dashboard` pass.
