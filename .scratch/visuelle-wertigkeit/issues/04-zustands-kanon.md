# 04 — A canon of states

Status: ready-for-agent

Blocked by: 01

Spec: `.scratch/visuelle-wertigkeit/spec.md`

## Scope

Hover, active, focus and disabled follow **one logic** across all components
rather than a habit per component. The canon fixes **by what means** a state
comes about, not only how strongly:

- **Hover** changes the surface.
- **Active** changes the surface more strongly and may additionally suggest a
  minimal settling.
- **Focus** is exclusively the existing ring (`--u-focus-ring`) and is never
  replaced by anything else. An element that shows focus by a change of surface
  instead of by the ring is to be corrected.
- **Disabled** reduces opacity and removes **every** reaction — no hover, no
  active, no pointer.

A single control must not break away from this without a reason. Where it does
break away, the reason stands at the site.

The first step is a survey: what does each component do today in each of the four
states? Only after that is it settled whether the canon needs new tokens or gets
by with the existing ones.

Perceived quality is noticed the moment somebody moves the mouse, and it falls
apart when three buttons have three different ideas of "pressed".

## Acceptance

- A survey of all four states across all components precedes the change and
  accompanies the delivery.
- Every new token a state introduces is covered by
  `tests-unit/kontrast.test.ts`. An optical upgrade must not cost legibility.
- `tests-visual/barrierefreiheit.spec.ts` stays green. In particular: no element
  loses its visible focus.
- The focus ring is the same across all components. Divergences carry their
  reason in place.
- Disabled elements react to nothing. This is to be checked also where the
  disabling today only changes the opacity and the hover underneath keeps
  running.
- The transitions between the states use the motion vocabulary from ticket 02, if
  that has already been delivered; otherwise the existing tokens. Raw values are
  in no case permitted — the check from ticket 01 holds that.
- Screenshot baselines may move; every moved baseline is looked at individually
  and justified.

## Notes

Independent of ticket 03; both can run in parallel.

The canon is deliberately formulated as a statement about **means**, not about
values. "Hover changes the surface" is checkable by looking and leaves open how
strongly — exactly the freedom this spec wants to preserve in the values. A
formulation such as "hover lightens by 4%" would be a value rule again and does
not belong here.

The most likely finding of the survey is that focus is additionally shown by a
change of surface in several places, because that was the obvious thing to do
while building the respective component. That is the case that makes the canon
most necessary: focus and hover thereby become indistinguishable.
