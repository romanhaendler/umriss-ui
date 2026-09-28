# 01 - The toast's anatomy and the deck

Status: done
Type: task

Spec: `.scratch/toast-refinement/spec.md` (stories 1-11; "Anatomy (B3b)", "Deck")

## Scope

- The B3b anatomy: fixed width 360px (phone: full width less 16px), the tone
  rail, the glyph inline at the start of the title, the spacing of the spec.
- Four tone glyphs drawn to the glyph specification, shown at 16px.
- The deck: closed with two cards behind at 14px, the "1 / N" count as a
  button, open on hover, focus within and the count, 8px gaps, every countdown
  standing still while open; reduced motion without movement.
- The deck grows away from its edge; this ticket only has `bottom-end`, so it
  grows upwards - written so that 02's positions only flip the direction.
- Wording for the count (English, German).

## Acceptance

- The existing toast tests green; new unit tests for the count's name, opening
  by focus and by the count, and the countdown standing still while open.
- `glyphs.test.ts` green without touching it.
- Pictures: single toast, with description, long title, closed deck, open
  deck - light and dark; every moved baseline looked at one by one.

## Comments

**Delivered.** `Toast.tsx` / `Toast.module.css` rebuilt: the B3b anatomy,
four glyphs to the specification at 16px (`glyphs.test.ts` untouched and
green), the deck with its count, opening by pointer, keyboard focus, count and
Alt+T, every countdown held while open. Wording `toastDeckCount`,
`toastRegion` (EN, DE). Unit tests: count and its name, opening by the count,
held countdowns, a toast arriving while open, the deck closing after a clicked
close button (a browser finding), Alt+T and Escape; each checked by a mutation
that makes it fail. Pictures: deck closed, deck open, light and dark.
