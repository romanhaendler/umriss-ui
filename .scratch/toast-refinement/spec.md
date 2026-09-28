# The toast, grown up

Status: ready-for-agent
Date:   2026-09-28
Origin: grilling session of 2026-09-28 - "our toasts are too basic, options are
missing, and with the glyph the design is not balanced: too much negative
space". Vocabulary: **Toast** (new), **Glyph**, **Tone**, **Provider** in
`CONTEXT.md`. The directions were decided on rendered prototypes, kept in
`prototype/` (open `directions-b.html` in a browser; the chosen variant is
**B3b**).

## Problem Statement

A developer using `useToast()` can say a title, a description, a tone and a
duration - nothing else. A toast cannot offer "Undo", cannot report that it
has gone, cannot turn from "Saving…" into "Saved", and always stands in the
bottom right corner. Five toasts in a row pile up as a column of five.

The toast also looks unfinished. A 24px tinted disc carries a 12px glyph beside
a 14px title: the disc is taller than the line, the title is pushed down 3px to
meet it, and once a description follows, the glyph sits alone at the top of an
empty column. The text column stretches to the close button, so a short title
leaves a wide empty field in the middle. The toast looks like an `Alert` with a
shadow instead of a thing of its own.

## Solution

A toast of its own shape (direction B3b):

- A fixed width of 360px; on phone width the full width less a 16px gutter.
- A short tone **rail** inset on the left edge, as long as the content block.
- The glyph is the first character of the title - it sits on the title's first
  line, and a wrapped title returns to the left edge, so title, description and
  action share one left edge. No disc.
- One action, as a text button under the text.

Several toasts stand as a **deck**: the newest in front, at most two behind it
showing 14px of their edge. The front card carries a count - "1 / 3" - which is
a button that fans the deck out; hover, focus inside it and Alt+T fan it out as
well.

And the options a toast in an application needs: one action, a close callback
with its reason, updating a toast by its id (with a `loading` tone that shows a
spinner and has no timer), six positions, and a limit on how many stand at once.

## User Stories

### Reading a toast

1. As a user, I want the glyph to sit on the title's first line and the text to share one left edge, so that the toast reads as one block and not a glyph with text beside it.
2. As a user, I want every toast the same width, so that a deck of toasts has one silhouette.
3. As a user, I want a long title to wrap rather than be cut, so that I never see less than a screen reader hears.
4. As a user, I want the tone shown by the rail, the glyph and the words together, so that colour is never the only carrier.
5. As a user on a phone, I want the toast to span the screen's width with a gutter, so that it neither overflows nor floats narrow in a corner.

### Several toasts

6. As a user, I want several toasts to stand as a deck, so that five confirmations do not cover a fifth of the screen.
7. As a user, I want to see that more than one toast is open even while the deck is closed, so that nothing hides behind the front card unnoticed.
8. As a user, I want to fan the deck out by hovering, by focusing into it, by pressing its count, or with Alt+T, so that it opens with a mouse, a finger or a keyboard.
9. As a user, I want the equal gap between toasts in a fanned-out deck, so that it reads as a list.
10. As a user, I want the countdown to stand still while the deck is open, so that nothing leaves while I read.
11. As a user, I want no more than three toasts at once, the oldest giving way, so that old news does not queue up and arrive late.

### Acting on a toast

12. As a user, I want an action such as "Undo" in the toast, so that I can reverse what just happened in passing.
13. As a keyboard or screen reader user, I want to reach the toasts with Alt+T and have their countdown stop while focus is inside, so that an action is not gone before I get to it.
14. As a user, I want a toast that is still at work ("Saving…") to show a spinner, have no close button and not leave by itself, so that it never claims to be finished.
15. As a user, I want that toast to turn into its result in place, so that "Saving…" becomes "Saved" instead of a second toast.

### Building with toasts

16. As a developer, I want `action: { label, onClick }`, so that I can offer one action without composing my own toast.
17. As a developer, I want `onClose(reason)` with `"timeout" | "dismiss" | "action"`, so that I can tell an undo window that ran out from one that was used.
18. As a developer, I want `update(id, options)`, so that I can move a toast from `loading` to its outcome.
19. As a developer, I want to set the position once in the `UmrissProvider`, so that toasts stand where my layout leaves room.
20. As a developer, I want to set the limit in the `UmrissProvider`, so that a dense application can allow fewer or more than three.
21. As a developer, I want the title rule written in the JSDoc and the demo, so that I write "Shift plan not published" and put the reason in the description.

### Demo

22. As a reader of the demo, I want examples from a single toast to an undo flow, a save with loading, a deck and the positions, so that each option is shown doing its work.

## Implementation Decisions

### Anatomy (B3b)

- The toast is a grid of two columns: the text block (`1fr`) and the close
  button; with the count, three: text, count, close. The count and the close
  button align to the title's first line (height `1lh`).
- The glyph stands inline at the start of the title, in a box `1lh` tall,
  `margin-inline-end` 8px, pulled 2px to the start so that it stands optically
  flush with the description under it.
- The glyphs are drawn to the glyph specification (`lib/glyphs`, viewBox 10,
  stroke 1.4, no fill, round ends, `aria-hidden`) and shown at 16px. The
  prototype's glyphs are sketches and do not meet it; `glyphs.test.ts` holds
  the new ones. Success: a check; danger: a ring with a bar and dot; warning:
  a triangle with a bar and dot; neutral: a ring with a dot and bar.
- `loading` shows the existing `Spinner` in the glyph's place - a spinner is not
  a glyph (`CONTEXT.md`) - and no close button.
- Spacing: padding 12px, 18px at the start for the rail; rail 3px wide, 8px
  from the edge, inset top and bottom by the padding; title to description 2px;
  text to action 6px; 8px between toasts in a fanned deck.
- Surface, shadow and radius as today (`--u-color-surface`,
  `--u-shadow-overlay`, `--u-radius-lg`). Neutral and loading take
  `--u-edge-color-strong` for the rail.

### Deck

- Closed: the front card at its natural height; up to two cards behind it,
  clipped to the front card's height, each 14px further back and 4% smaller.
  Further cards are hidden.
- The count "1 / N" is a `button` in the front card's title row, before the
  close button, shown while the deck is closed and N > 1. Its accessible name
  comes from the wording ("N messages, show all").
- Open: every card at its natural height, 8px apart. The deck opens on
  pointer enter, on focus within, on the count, and on Alt+T (which moves focus
  into the region); it closes when both pointer and focus have left it.
- While the deck is open every countdown stands still; the existing
  pause/resume per toast becomes pause/resume for all.
- The deck grows away from the edge it stands at: upwards at the bottom
  positions, downwards at the top ones.
- The layout is CSS; JavaScript decides only open or closed and the count. The
  heights of the cards behind come from the front card and are not measured
  per card.
- `prefers-reduced-motion`: the deck changes between closed and open without
  movement.

### Options

- `ToastOptions` gains `action?: { label: string; onClick: () => void }` and
  `onClose?: (reason: "timeout" | "dismiss" | "action") => void`.
  Pressing the action runs `onClick`, then the toast leaves with `"action"`.
- `ToastTone` gains `"loading"`. It has no timer and no close button; for
  `roleFromTone` it is `status`.
- `useToast()` returns `{ toast, update, dismiss }`. `update(id, options)`
  merges the options into the toast. Changing to another tone starts the
  duration afresh (the default or the given one); an id that no longer stands
  does nothing.
- A toast with an action keeps the ordinary duration. The countdown stands
  still under the pointer and while focus is inside (story 13); the JSDoc says
  that the action must never be the only way to do what it offers.
- `ToastConfig` (the Provider's `toast`) gains
  `position?: "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end"`
  (default `bottom-end`, as today) and `limit?: number` (default 3). There is no
  position per toast.
- Over the limit, the oldest toast leaves as if dismissed (`onClose("dismiss")`).
- On phone width the toast spans the viewport less 16px each side, at the top
  or bottom edge its position names; start/center/end no longer apply there.
- Wording (English and German): the count's name, the region's name that Alt+T
  lands on. `closeToast` stays.
- The title rule goes into the JSDoc of `title`: what has happened, short -
  about one line, 45 characters - the reason and the next step belong in the
  description.

## Testing Decisions

A good test here checks what a user or developer observes: a role, a name, a
callback's reason, which toasts stand - not class names or the timer map.

- Unit (`packages/core/tests-unit/toast.test.tsx`, with fake timers, as the
  existing tests do): `onClose` with each reason; the action runs and closes;
  `update` from `loading` to `success` starts the timer; `loading` has no close
  button and does not leave; the fourth toast removes the first with
  `"dismiss"`; a `limit` from the Provider; the countdown stands still while
  focus is inside; Alt+T moves focus into the region; the count's accessible
  name.
- Glyphs: `glyphs.test.ts` covers the new glyphs without change to the test.
- Visual (`packages/core/tests-visual/features-basics.spec.ts` and the demo
  examples): a single toast, one with description and action, a long title, a
  closed and an open deck, `loading`; light and dark. Every moved baseline is
  looked at one by one.

## Out of Scope

- More than one action, or arbitrary content in a toast - that is a dialog.
- A position per toast.
- A queue for toasts over the limit.
- A progress bar for the remaining time.
- A promise shorthand (`toast.promise`); `update` covers it in three lines.
- A custom or no glyph.
- Swipe to dismiss.

## Further Notes

- The prototype's deck measures heights in JavaScript and once got the gaps
  wrong doing so; the implementation keeps that in CSS.
- `Alert` keeps its tone edge and its look; the toast is deliberately not an
  `Alert` with a shadow.

## Comments
