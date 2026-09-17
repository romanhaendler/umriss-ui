# 06 — The tile, the record, the open question

Status: done

Spec: `.scratch/tree-view-reach/spec.md`
Blocked by: 01, 02, 03, 04, 05

## Scope

- **The demo tile gains the new states.** A disabled node with a reason a person
  would recognise — a folder they may see but not choose — and a branch that
  loads its children when opened, with the loading shown. Keep it a tree someone
  would actually build.
- **A control for opening and closing everything**, so the gesture is discoverable
  rather than only programmatic.
- **Screenshot baselines** for the new states in both themes.
- **The tile stays in the accessibility sweep.**
- **The capability record** gains every behaviour this package adds, each with the
  level it is actually proven at. Claim nothing that is not there.
- **ADR-0003 points at ADR-0005**, so a future reader does not act on the part
  that was overturned.
- **The open accessibility question is written down, not resolved by assertion.**
  The tree reports checking through `aria-checked` on each node and omits
  `aria-multiselectable`, which the authoring practices describe in terms of
  `aria-selected`. That reading is defensible and unverified. Record it as
  unverified in the capability record, and say so in the delivery report.

## Acceptance

- The tile shows a disabled node and a loading branch, in both themes, and its
  baselines exist.
- Opening the loading branch in the demo actually fetches — a simulated delay is
  fine, and honest, as long as the loading state is visible.
- The accessibility sweep passes on the tile.
- The capability record names no behaviour that is not implemented and claims no
  proof level that does not exist, including the `aria-multiselectable` question
  which is recorded as **not verified**.
- The full unit, browser and screenshot suites pass.

## Notes

Resolve the `aria-multiselectable` question by testing with a screen reader if one
is available, and by leaving it recorded as unverified if one is not. Do not
resolve it by reasoning about the specification — the reasoning is already in the
code comment, and the reason it is still open is that reasoning was not enough.

The tile is documentation. A disabled node needs a reason the reader can infer
without a caption: an archive folder, a locked period, someone else's area. "Node
B (disabled)" teaches nothing.
