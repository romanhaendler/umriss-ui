Status: done
Date:   2026-10-21

# The badge's dot is a circle

## Problem Statement

A Badge carries a small status dot (5 px) before its word. The build gives every
radius of the library's own elements a squircle (`corner-shape: squircle`), the
dot included - and a squircle that small is a rounded square. Where the browser
supports `corner-shape`, the dot of every badge reads as a tiny square, not as
the quiet round anchor the comment in its stylesheet promises. The Sparkline's
end point, the same 5 px, and the Stepper's markers already opt out with
`corner-shape: round`; the badge's dot was left out.

## Solution

The badge's dot declares `corner-shape: round`, as the Sparkline's end point and
the Stepper's marker do. The build sees a declared corner shape and adds no
squircle, so the dot is a circle in every browser. The badge itself - its
rectangle and its `pill` form - keeps the squircle.

## User Stories

1. As an application user, I want the dot in a badge to be round, so that it reads as a status mark and not as a tiny square.
2. As an application user, I want the dot in a badge to look the same as the end point of a sparkline, so that the library's small status marks speak one language.
3. As an application user on a browser without `corner-shape`, I want the badge to look as it does today, so that nothing changes where the squircle never applied.
4. As an application user in forced colours, I want the dot to keep the text colour and its round shape, so that the badge still shows its anchor point.
5. As a developer using Badge, I want the dot round in every tone (`neutral`, `accent`, `success`, `warning`, `danger`), so that no tone looks different in shape.
6. As a developer using Badge, I want the dot round in the `pill` form too, so that counters and labels carry the same mark.
7. As a developer using Badge, I want the badge's own corners to stay squircles, so that the badge keeps the library's look.
8. As a developer, I want no new prop or token for this, so that the Badge API stays as it is.
9. As a maintainer, I want the badge's dot to follow the rule already written in the design language ("a mark that shows a state is round, a key is not"), so that the rule has no silent exception.
10. As a maintainer, I want the design language to name the badge's dot beside the stepper's markers, so that the next reader finds every round mark in one place.
11. As a maintainer, I want the dot's stylesheet comment to say why it is round, in the words the Sparkline and Stepper comments use, so that nobody removes the declaration as noise.

## Implementation Decisions

- Only the Badge stylesheet of `@umriss-ui/core` changes: the dot rule (the badge's `::before`) gets `corner-shape: round` right after its radius.
- The comment beside it says what the Sparkline's end point says: a circle and not the library's squircle, which the build adds to every radius, because a squircle this small is a rounded square.
- The build step that adds squircles (`ownCorners`) is not touched: it already leaves a rule with a declared corner shape alone.
- The badge's own rule and the `pill` rule keep their radius and so keep the squircle.
- The forced-colours rule for the dot changes nothing about shape; it only repaints the ground, so it needs no edit.
- No API change: `API.md` stays as it is.
- The design language's squircle paragraph names the badge's dot beside the stepper's markers as a mark that shows a state and is therefore round.
- The changelog gets one line at release (core, patch): the badge's dot is round where the browser draws squircles.

## Testing Decisions

- A good test here checks what ships, not how the stylesheet is written: the built rule for the dot carries `corner-shape: round` and no squircle.
- The mechanism is already covered: the `ownCorners` unit test in core's stylesheet-rules suite proves that a rule with a declared corner shape keeps exactly one `corner-shape`. No new seam is needed for it.
- No new unit test for the Badge: the Sparkline's and Stepper's identical exceptions have none, and a test that greps one declaration in one stylesheet would only restate the line.
- The visual suite (Chromium, which draws `corner-shape`) shows every badge; its screenshots of badges may change by the dot's corners. Run `pnpm test:visual` for core on a quiet machine and update the badge baselines only if the diff is the dot alone.
- `pnpm check core` and `pnpm check:site` must pass.

## Out of Scope

- The badge's rectangle and its `pill` form: they keep the squircle.
- Other small round marks that the build also turns into squircles - the radio's inner dot (6 px), the date picker's day dot (4 px), the tree view's 3 px mark. Whether they follow the same rule is a separate question.
- Any change to the `ownCorners` build step, such as a size threshold below which it keeps corners round.
- A new token or prop for the corner shape.

## Further Notes

- Prior art: the Sparkline's end point (DataViz stylesheet) and the Stepper's marker both declare `corner-shape: round` with a comment saying why; the badge's dot follows them word for word.
- The built core stylesheet today ships the dot as `width:5px;height:5px;border-radius:var(--u-radius-full);corner-shape:squircle` - the fault is visible there without a browser.

## Comments

Delivered 2026-10-21. The badge's dot declares `corner-shape: round` with the
Sparkline's comment; the built core stylesheet now ships the dot as
`corner-shape:round`. The design language names the badge's dot beside the
stepper's markers. `pnpm check core`, `pnpm check:site` and the core visual
suite (1340 passed) are green; no screenshot baseline changed. The changelog
line is still due at release.
