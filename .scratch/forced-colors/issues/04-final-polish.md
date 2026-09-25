# 04 - Final polish round

Status: ready-for-human
Type: task

Spec: `.scratch/forced-colors/spec.md`

## Scope

The visible result goes to the user as a rendered before/after page (the
review page pattern of visuelle-wertigkeit 05): every surface of this spec in
light and dark, each decision a card. Spacing, tracking and optical corrections
are settled by the agent; new tokens or visibly new colours go as a card first.

## Acceptance

- The user has taken every card on the review page.
- Every moved screenshot baseline looked at individually, never rebuilt in bulk.

## Comments

**Core part delivered** (the table's and the schedule's parts belong to other agents; this ticket stays open for them):

- **fc-buttons**: under forced colours the primary button's outline is 2px, the second pixel inside (`outline-offset: -1px`), so it stands as large as its neighbours; secondary, ghost and danger keep 1px. Focused, the offset returns to 0 - needed, not cosmetic: with the same geometry at rest and in focus, Chromium kept painting the resting `CanvasText` over the focus `Highlight` (the computed colour was right, the paint was not). With the offset the focused button looks exactly as before (`forced-focus-button` unchanged).
- **fc-badge-dot**: under forced colours the badge's dot is drawn in `CanvasText`.

Baselines moved: `forced-button--variants` and `forced-buttongroup--buttons-that-belong-together`, light and dark (the primary group's frame and dividers are now 2px). Each looked at. The badge's forced picture stays within the tolerance (a few dots) and was looked at in the browser.
