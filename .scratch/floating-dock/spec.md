# Spec: A dock that belongs to the surface it acts on

Status: done

Origin: `/grill-with-docs` session, 10 Sep 2026. The brief: "something like a floating dock where actions can be placed. Maybe like the dock under macOS? Only movable?" — with the stated goal of a clean, considered look in the library's own idiom. Sharpened over four rounds: it is a tool palette for one surface, not a launcher; it snaps rather than floats freely; it takes the Dock's material and refuses its magnification.

Sequencing: `command-palette` is delivered and established the translucent material (ADR-0012) this reuses. Nothing blocks it. `TableToolbar` is untouched.

Tickets: `.scratch/floating-dock/issues/` — six.
Glossary: five terms added to `CONTEXT.md` under **Reaching for a tool**.
ADRs: `docs/adr/0013-a-dock-snaps-it-does-not-follow.md`, `docs/adr/0014-a-turn-that-cannot-be-a-transition.md`.

Prose is English per `CONTEXT.md`, identifiers German.

---

## Problem Statement

The library has thirty-five components and no way to put a handful of actions
over a working surface without taking space away from it.

`TableToolbar` is the closest thing, and it is not close. It is a strip in the
flow above a table: a `div`, two slots, no state, no keyboard, no aria
(`packages/ui/src/components/Table/Table.tsx:366`). It works because a table
has a top edge that is naturally chrome. A chart does not. A plant overview
does not. On those, a strip above the content is content pushed down, and on
the screens this library is built for — wide, dense, one view at a time — every
row of pixels spent on chrome is a row not spent on the thing being watched.

The second half of the problem is that a floating strip has a defect a docked
one does not: it covers something. Whatever it covers is exactly the material
the user is looking at, because that is why the strip is there. So a floating
strip that cannot be moved is worse than no strip. Movability is not a feature
here, it is the condition on which the whole idea is admissible.

And there is a trap in the reference. The macOS Dock is the obvious model, and
two of its three defining traits are wrong for this house. The magnification is
decoration, and `tokens.css` says motion explains state changes and does not
decorate; `HANDOFF.md` forbids flashy animations and playful effects by name.
The large coloured icons would make the dock the most saturated surface in a
system whose entire colour discipline is one accent reserved for interaction —
in a library whose charts save colour for meaning. Taking the Dock wholesale
would produce something that looks like macOS inside something that does not.

## Solution

A `Dock`: a strip of glyph-only tools that floats over one host area and
carries the actions for that area, sitting at one of four named resting places
along the host's edges, moved by a grip with the pointer or the keyboard, and
turning between horizontal and vertical as it moves between a top/bottom edge
and a left/right one.

What is taken from the Dock: the translucent material, the rounded capsule, the
sense of a thing lying over the page rather than in it, and the orientation that
follows the edge. What is refused: the magnification, the colour, and the free
float.

What is taken from this library: the material tokens the command palette
established (ADR-0012), the glyph spec in `GLYPHEN.md`, the roving-tabindex
habit of `TreeView` and `Tag`, `Tooltip` for the names, and the rule that the
library remembers nothing.

## User Stories

### Placing

- As a developer, I wrap a chart in a positioned container and render a `Dock`
  inside it, and the dock floats over that chart and nowhere else.
- As a developer, I put two charts side by side, each with its own dock, and
  neither dock claims to act on the other's chart.
- As a developer, I set `defaultPlace="unten"` and the dock starts at the bottom
  edge; I set `place` and `onPlaceChange` instead and I own where it sits.
- As a developer, I want the dock's position to survive a reload, and I store it
  myself, because the library stores nothing.

### Moving

- As a user, I grab the grip and drag toward the right edge; as my pointer
  enters the right edge's zone the dock arrives there and turns upright, and I
  can see that I have chosen the right edge before I let go.
- As a user, I change my mind mid-drag and move back down; the dock returns to
  the bottom edge and lies flat again.
- As a user, I press Escape mid-drag and the dock is where it was.
- As a user, I tab to the grip, press the Left arrow, and the dock moves to the
  left edge. No key nudges it by pixels, because there is nowhere between edges
  to nudge it to.
- As a user on a wide, short chart, I drag toward the left edge and the dock
  declines to go there, visibly, because upright it would not fit.

### Taking a tool

- As a user, I tab into the dock and the arrow keys walk the tools; Tab leaves
  the dock rather than walking it.
- As a user, I hover a tool and its name appears; I reach it with a screen
  reader and hear the same name.
- As a user in an application that has modes, I see which tool the dock stands
  in, marked in the accent, and I see it change when I take another.
- As a user in an application that has no modes, no tool is ever marked, and
  the dock is simply a strip of actions.

### Feeling

- As a user, the dock reads as something lying over the surface, not as a card
  drawn on it: the surface is faintly present behind it, and never legible
  through it.
- As a user with reduced motion, nothing animates and everything is still
  correct: the dock is simply at the new place.
- As a user, I never see the dock halfway between two edges, at an angle, or
  partly outside its host.

### Maintaining

- As a maintainer, I can unit-test "which resting place does this pointer
  position choose" without a browser.
- As a maintainer, I can read `CONTEXT.md` and know why the chosen tool is
  called a mode and not an active tool.
- As a maintainer, I can read ADR-0013 and not "fix" the snapping into a drag.

## Implementation Decisions

### The domain model

Five terms, written into `CONTEXT.md` under **Reaching for a tool** during the
session rather than after it: **Dock**, **Tool (Werkzeug)**, **Resting place
(Ruheplatz)**, **Grip (Griff)**, **Mode (Modus)**.

Two collisions were resolved rather than tolerated.

A dock entry is a **Werkzeug** and not an `Eintrag`, `item`, `entry`, `Aktion`
or `Befehl`. The first three are on the avoidance list of the palette's
**Candidate**; `Aktion` is too wide, since every button in the library is an
action; `Befehl` is already marked under **Finding** as only one kind of
payload. The distinction that makes `Werkzeug` right is that a candidate is
something one *finds* and a tool is something one *takes*.

The chosen tool is a **Modus** and explicitly not `aktiv`. `Active node
(aktiver Knoten)` is taken by the tree, where it means the one node carrying
focus, and ADR-0003 exists precisely to insist that it is not a selection. A
mode is the opposite: a lasting choice that focus cannot change. One word
answering two questions is the failure `CONTEXT.md` names under **Find**.

Outward-facing prop names stay English, as with the palette: `tools`, `place`,
`defaultPlace`, `onPlaceChange`, `mode`, `onModeChange`.

`place` and not `edge`: `--u-edge` is the library's border-as-shadow and the
word is spoken for. `place` and not `restingPlace`: the palette already has
`restingItems`, and one adjective doing two unrelated jobs on the public
surface is the same mistake in English that the glossary forbids in German.

### The resting places

Four, at the centre of each edge of the host area, named `"oben"`, `"rechts"`,
`"unten"`, `"links"`. Orientation follows from the place: lying along top and
bottom, standing along left and right.

Corners are not resting places. A corner names no orientation, so the dock
would have to invent one, and an invented orientation is arbitrary — which
reproduces exactly the defect that made free floating unacceptable: no place is
the right place, so it looks slightly wrong everywhere.

Alignment along the edge (start / centre / end) is a second axis of choice and
is out of scope. Centred is the one that reads as intended.

### The tools

Glyph only. A dock standing along a side edge has no room for text, and a
component whose anatomy changes with its orientation is two components. The
name reaches the eye through `Tooltip` and the assistive layer through
`aria-label`.

Glyphs follow `GLYPHEN.md`: `viewBox="0 0 10 10"`, stroke `1.4`, `currentColor`
only, `fill="none"`, round caps, `aria-hidden`. Any glyph the set does not have
is drawn to spec and added to the set, and any deviation is recorded in
`GLYPHEN.md` with its reason.

Tools are passed as a prop, as the palette passes candidates, and not as
children. The dock has to know how many there are to answer whether it fits
upright (see **The refusal**), and it has to be able to lay them out in either
orientation. Children would make both of those a DOM measurement of something
the caller already knows.

### The surface

The material of ADR-0012, unchanged: `--u-color-material-fallback` written
first and unconditionally, upgraded to `--u-color-material` plus
`backdrop-filter: blur(var(--u-material-blur))` inside
`@supports (backdrop-filter: blur(1px))`. `--u-shadow-overlay` for the layer,
`--u-radius-xl` for the capsule — the palette's radius, because both are
windows over the application rather than panels within it.

No scrim. A scrim says "nothing else is available now", and the dock is not a
mode over the application; it is a tool for the surface underneath, which stays
fully live.

No z-index. The dock is `position: absolute` inside its host's positioned
container and takes its stacking from there. It never enters the `--u-z-*`
scale, because it is not app-level: `--u-z-toast` is what app-level looks like,
and the dock deliberately is not that.

### The grip

At the leading end of the strip: the left end when lying, the top end when
standing. It is the one part of the dock that moves it.

The alternative — grab anywhere on the strip — makes every `pointerdown`
ambiguous between taking a tool and moving the dock, resolvable only by a drag
threshold. Thresholds are how a control comes to do the wrong thing
occasionally, and occasionally is worse than never for a library that is trying
to look considered.

The grip is a single tab stop, separate from the tools' roving tabindex, and it
announces what it is. The four arrow keys on it are the four resting places:
`ArrowUp` → `"oben"`, and so on, absolutely and not relatively, so that the
keyboard cannot end up somewhere the pointer cannot.

### The snap

Per ADR-0013. During a drag the dock is never at a coordinate. The host
rectangle is divided into four zones, one per edge; when the pointer enters a
zone the dock moves to that place and stays there. The grip tracks the pointer
so that the hand has something that follows.

`setPointerCapture` on the grip, as `Table.tsx:156` does for column resize.
There is deliberately **no** shared drag module: the table maps a delta onto a
continuous width, the dock maps a position onto one of four names, and all they
share is one platform call.

What *is* a module is the pure part: `platz.ts`, beside the component, holding
"given a pointer position and the host rectangle, which resting place" and
"given a place, the tool count and the host rectangle, does it fit". No React,
no DOM, unit-tested — the arrangement `TESTS.md` prescribes for pure logic.

### The turn

Per ADR-0014. FLIP: measure each tool's box, apply the new orientation,
measure again, invert as a transform, play to zero. One duration for all three
simultaneous changes — the container's shape, each tool's slot, and the dock's
travel to the other edge — because two durations read as two events and this is
one. `--u-duration-medium` with `--u-ease-out`.

Glyphs stay upright throughout. Under `prefers-reduced-motion` the routine is
skipped entirely and the dock appears at the new place; that snap is the
correctness baseline, and the animation is never where the layout is decided.

### The refusal

A place whose orientation the dock does not fit into is not offered. Nine tools
lying flat are roughly 360 × 44; standing they are 44 × 360, and a wide, short
chart has room for the first and not the second. The zone declines the pointer
and shows that it is declining, so that the refusal is a statement rather than
an outage — a place that silently does nothing reads as a broken control.

An overflow menu was rejected. It brings an anchor, an open state, a dismissal
policy and a keyboard chain, which is `Popover` and `Menu`, and the dock would
then carry two anatomies — the thing the command palette's own header comment
refused when it declined to be a parameterised `Modal`.

### The mode

Optional and the caller's. `mode` names at most one tool; when it is absent no
tool is ever marked and the dock is a strip of actions. Marked in
`--u-color-accent`, which is that token doing precisely its stated job: one
accent, only for interactive state.

Not persisted, not defaulted to the first tool. A dock that invents a mode
nobody set has made a claim about the application's state that it is not in a
position to make — the library's standing rule that business meaning belongs to
the caller.

### Covering

Nothing automatic. The dock does not fade, retreat or hide when the pointer is
elsewhere: `HANDOFF.md` forbids playful effects, and a control that hides when
you are not looking at it is one you cannot find. The answer to "it covers
something" is that it can be moved, which is the whole reason it moves.

Collapsing to the grip on an explicit gesture is a defensible later addition
and is out of scope, because it doubles the state space — open/collapsed by
four places by mode — for a second escape route where one already exists.

### The demo

One tile, `data-kachel`, in the `@umriss/ui` showcase: a dock over a
stand-in surface with a handful of tools, one of them the mode, and the four
places reachable by both gestures. The tile is what the baselines and the axe
run photograph.

## Testing Decisions

- **Unit (`tests-unit/`)**: `platz.ts` in full — the zone arithmetic at
  boundaries and centres, the fit predicate at the exact width where a tool
  count stops fitting, and the arrow-to-place mapping. Fixtures are built in the
  test; expected values are computed by hand and not by calling the
  implementation back.
- **Behaviour (Testing Library)**: the grip is one tab stop and the tools roving;
  Tab leaves the dock; four arrows on the grip reach four places; Escape mid-drag
  restores the place; `mode` marks exactly one tool and none when absent;
  controlled `place` is not moved by the component itself.
- **Playwright interaction (light project only)**: a pointer drag from the bottom
  edge into the right zone lands at `"rechts"` and turns; a drag into a zone that
  does not fit is refused; the grip follows the pointer while the dock does not.
- **Baselines**: resting states only, four places, light and dark. No frame is
  captured mid-turn — a picture of a transform on its way to zero is a test of
  timing, not of appearance.
- **Accessibility**: the tile through axe in both themes, WCAG 2.1 AA. Tool names
  must be reachable without hover.
- **Reduced motion**: the turn is skipped and the resulting layout equals the
  animated end state. This is the test that keeps the animation out of the
  layout.

Commands before delivery: `pnpm test:unit`, `pnpm test:visual`, `pnpm lint`.

## Out of Scope

- Alignment along an edge (start / centre / end).
- Corners as resting places.
- Collapsing to the grip.
- An overflow menu, or any scrolling of the strip.
- Labels on tools.
- Persisting the place or the mode anywhere in the library.
- Magnification, or any hover-driven change of a tool's size.
- Nested or grouped tools, separators, badges on tools.
- A second dock cooperating with a first one on the same host.

## Further Notes

`TableToolbar` is not touched and not deprecated. It remains what it is: a strip
in the flow above a table. The `Dock` entry in `CONTEXT.md` names the difference
so that a later reader does not try to merge them.

The material tokens are already public, so an application that wants its own
overlay to match the dock can use them rather than approximate them. Nothing in
this work changes them.

If the grip's tracking reads as broken rather than as resistance — the risk
ADR-0013 names — the correction is in how far the grip travels, not in letting
the dock follow the pointer. That would be a different component.
