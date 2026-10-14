# 03 - Holding the toasts back

Status: ready-for-agent
Type: task
Size: L

Blocked by: None (can start immediately)
Spec: `.scratch/toasts-held/spec.md`, Solution ("`held` on `ToastProvider`"),
Implementation Decisions ("One prop, on the provider" to "Dialogs unchanged");
user stories 1-26, 28, 29, 43, 44

## What to build

`held?: boolean` on `ToastProvider`, default false. While true, the toasts are
held back: none is seen, heard, pressed or reached by the keyboard, and what
lies under the region's place can be used as if no toast stood. When false
again they come back with the time they had left, and nothing was lost.

- **Out of sight at once:** no card drawn or hit, none in the tab order or the
  accessibility tree; the region is no landmark and not focusable. The two
  live regions stay in the document. No exit transition, no `onClose`; a card
  already leaving finishes unseen.
- **Time:** the hold stands every countdown still, as an open deck does. A
  toast that arrives waits with its full duration; one updated from loading to
  success counts from the end of the hold.
- **The API:** `toast()` returns its id as always; `dismiss()` calls
  `onClose("dismiss")` at once and the toast never appears; `update()` changes
  what will appear; over the limit the oldest gives way with `dismiss` at once.
- **Keyboard:** Alt+T is not listened for, so the key reaches the page. A
  focus in the deck when the hold begins goes back where it came from, as with
  Escape; hover, focus and pin are let go, so the deck is closed.
- **Coming back:** at the region's current place, ordered by arrival, each
  card with its entrance (none under reduced motion). A toast that arrived
  during the hold enters its live region now, by its tone. A card that stood
  before is **not inserted again**: its node stays, and its entrance restarts
  on that node (not by building the card anew, which the move into a dialog
  does).
- **Dialogs:** the region still moves into the topmost modal dialog and the
  top layer, held or not.
- **The example** "Hold the toasts" on the Toast page: a switch beside a
  button that sends one. The prop text (the spec's wording) and one sentence
  on the Toast page: what `held` is for, and that nothing is lost.

## Acceptance

- [ ] Unit, a new group "Toast – held", fake timers, through `ToastProvider`
      and `useToast`:
  - [ ] with `held` no card is in the accessibility tree and none is focusable;
  - [ ] a 5 s toast held at 3 s for 10 s leaves 2 s after the hold ends;
  - [ ] a toast arriving during the hold leaves its full duration after it,
        and its text enters the live region only then;
  - [ ] a toast that stood before the hold is not inserted into the live
        region a second time (an observer on it sees no insertion);
  - [ ] `dismiss()` during the hold calls `onClose("dismiss")` at once, and
        the toast does not come back;
  - [ ] `update()` during the hold: the new text comes back; loading turned
        success counts from the end of the hold;
  - [ ] four toasts during the hold with limit 3: the oldest goes with
        `dismiss` at once, three come back;
  - [ ] Alt+T during the hold moves no focus; a focus in the deck goes back
        when the hold begins;
  - [ ] holding calls no `onClose` of a standing toast.
- [ ] Browser, on the new example: with `held` the element at the centre of
      where the close cross stood is the page's, and a click reaches it; after
      the hold the cross is there again and the deck stands where it stood.
- [ ] The example's pictures in both themes.
- [ ] Without `held` every existing unit and browser test of the toasts stays
      green.
- [ ] The props generator, `pnpm check core`, `pnpm check:site`,
      `pnpm test:visual:quick core`.
