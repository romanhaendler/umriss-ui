# 09 — The miniature

Status: ready-for-agent
Type: task

Blocked by: 08
Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 29–32, 39, 41)

## Scope

- Strips: main time in the task colour, setup and teardown faint, nothing else; height per the spec's rule, inner groups as hairlines.
- Overlap marks on strip and row; late transports as ever; findings computed per real lane, unchanged.
- Transports take y from the slot; `attach` compares slot tops.
- Hit, hover, tooltip, selection on strips; no grips for a box in a miniature. `clientPointOf`/`positionAt` answer with the slot.

## Acceptance

- Unit: slots and strip geometry. Browser: a transport arrives at a strip; an overlap inside a folded group is visible; a strip can be hovered and selected; `findings()` equal folded and unfolded.
- Examples: a folded group with transports, a finding inside a fold. Pictures new, count stated.

## Comments
