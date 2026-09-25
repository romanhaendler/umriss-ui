# 02 - The control room page

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/control-room-demo/spec.md`

## Scope

R1, R3, R4.

## Acceptance

- Screenshot light/dark with the fixed clock; axe; own-base check.

## Comments

Delivered as the rubric "Control room" (`control-room`) with one page,
`#/control-room`, in the core demo: `examples/Control-room/01-one-minute-three-places.tsx`
(the crossing minute read by a Stat, a trend and the alarm list) and
`99-demonstration.tsx` (the whole room: Stat with freshness, trend with
LimitBand and DataTable, AlarmList with hidden alarms and acknowledging,
ControlChart, Schedule with the now line and a Drawer per batch with its
ProgressBar, the OEE Calculation). Both show `plant.ts` in a second tab; a
"Why it is like this" records R1-R4.

R3: the clock advances by what `Date.now()` says has passed, so the suites'
frozen clock is a still page; it starts paused under reduced motion, and Pause
stops it (a page that updates on its own owes a way to stop it).
R4: each region is a named `Card` (a landmark); the skip links move the focus
and prevent the navigation, because a fragment would leave the demo's address.
`features-control-room.spec.ts` holds both. Screenshots (page head and both
examples, light and dark), axe (`control-room` in the sample) and own base
pass; the overview's two pictures moved for the new rubric, nothing else did.

After the review since `main`: the region a skip link lands on shows the
library's ring; the kiln's numbers stand once (`KILN` in `plant.ts`); only a
batch in the kiln fires tiles, so the OEE and the batches count the same ones;
the demonstration opens a few minutes after the crossing, with the alarm
standing, the tile in alarm and the control chart marking it; the lint's
exemption is narrowed to the page and its plant.
