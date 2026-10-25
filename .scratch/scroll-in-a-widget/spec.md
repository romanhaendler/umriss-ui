# Content taller than its size scrolls in its widget

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "Scroll in a dashboard widget" (its Answer holds
every decision below); findings `.scratch/shakedown/dashboard.md` 6 and the wish "Content that scrolls in
its widget", `wishes.md` section 1; ADR-0064, ADR-0050.

## Problem Statement

A widget's body cuts what does not fit its size, and it does so silently.

- The README's own example cuts a core `Stat` in a `small` widget by 15 px, and by 21 px in the editing
  mode.
- A chart with `height={260}` in a three-row widget loses 132 px, its axis among them. There is no scroll
  to reach it.
- A list or table longer than its size loses its last rows. The reader cannot reach them, and the author is
  not told.

The documented `height: 100%` recipe holds for a chart. It does not help content that is simply longer than
the room it has: that content needs its own scroll box, which the author has to know to write and to make
keyboard-scrollable.

The editing mode also takes about 6 px from the body. Content that fits at rest is cut further on "Edit".

## Solution

The height still follows the size, never the content (ADR-0064). What the content needs beyond the size
scrolls inside the widget's body.

- **The body is the scroll box.** Content taller or wider than its widget's body scrolls, so nothing is cut.
- **A scrolling body takes the keyboard.** While its content overflows, outside the mode, the body is a tab
  stop named by the widget's title.
- **The editing mode is unchanged in kind.** The body stays inert and stands where the reader left it.
- **The mode keeps the body at its height.** A widget that fits at rest also fits while the dashboard is
  arranged.
- **The documentation follows.** ADR-0064 is amended. The README says that content beyond the size
  scrolls, and its example fits. The dispatcher example shows a list that scrolls, and a check holds that
  every other widget in it fits.

## User Stories

1. As a reader, I want to reach the last rows of a list that is longer than its widget, so that I see every
   open alert, not only the first four.
2. As a reader on a keyboard, I want to tab to a widget whose content scrolls and scroll it with the arrow
   keys, so that I reach the same content a mouse reaches.
3. As a reader on a keyboard, I want a widget whose content fits to be no tab stop, so that tabbing through
   a dashboard of twenty widgets does not cost twenty extra stops.
4. As a screen reader user, I want the scrolling body named by the widget's title, so that I know what I
   have landed on.
5. As a reader on a phone, where the dashboard is a list, I want a widget's content to scroll inside its
   frame and the page to scroll past it, so that the list keeps its order and its heights.
6. As a reader arranging the dashboard, I want each widget to look as it does at rest, at the same scroll
   position, so that I decide its place by what I know it shows.
7. As a reader arranging the dashboard, I want nothing in a widget's content to start a drag, react to a
   click or take focus, so that arranging is never mistaken for using.
8. As an application developer, I want a chart that is taller than its widget to scroll rather than lose
   its axis, so that a wrong height shows as a scroll, not as a missing axis.
9. As an application developer, I want content that fills its size with `height: 100%` to fill it as
   before, without a scroll, so that the recipe I followed still holds.
10. As an application developer, I want a scroll box my content brings itself to keep working, so that a
    table widget with its own scroll does not get a second one.
11. As an application developer, I want the README's example to fit its sizes, so that the first thing I
    copy is not cut.
12. As the maintainer, I want a check that every widget of the dispatcher example fits its body, at rest and
    in the mode, so that the library's own example can never cut its content unnoticed again.
13. As the maintainer, I want ADR-0064 to say that content beyond the size scrolls and that the mode keeps it
    still, so that no later reader takes "the height follows the size" for "the content is cut".

## Implementation Decisions

- **The body scrolls on both axes.** The widget body's overflow becomes `auto` where it is `hidden`. The
  card around it keeps clipping to its rounded edge. The body's padding stays inside the scroll box, and the
  height a `height: 100%` child resolves against is unchanged.
- **The tab stop follows the overflow.** The dashboard measures each body in the browser: a resize of the
  body, a resize of its content, and content that replaces its root elements, as a Suspense fallback does.
  While the content is taller or wider than the body, the body carries a tab stop, a group role and the
  widget's title as its name. When the content fits, the body carries none of them. Its focus ring is drawn
  inside the body, where the card does not clip it. On the server and in a first render nothing is measured,
  and the body is no tab stop.
- **The mode leaves the body alone.** The body stays `inert` in the mode, which also takes away its tab
  stop. Its scroll position is not reset. The mode's head band and the body's padding in the mode are
  arranged so that the body has exactly the height it has at rest. The band keeps its look: it gets the
  room from the head, not from the body.
- **No new API.** No prop, no option, no wording, no token. `API.md` does not change.
- **ADR-0064 is amended** with the text given in ticket 02. There is no new ADR.

## Testing Decisions

- A good test here measures what the browser draws: the body's height, its scroll and client sizes, its
  scroll position, and what the keyboard reaches. It does not assert on class names or computed styles.
- The seam is the dashboard's existing visual suite, beside the placement and width checks, tagged
  `@quick`. jsdom has no layout, so the unit tests keep only what they test today: the body is inert in the
  mode.
- The accessibility suite already runs axe on every page. A scrolling body without a tab stop fails it
  (`scrollable-region-focusable`), so the dispatcher's scrolling list is checked without a new test.
- The screenshots of the mode are renewed and compared by eye with the old ones. The band must look the
  same.
- Prior art: `features-placement` measures the widget boxes against the library's packing, and
  `features-widths` checks the list form at 390 px. Charts' "Show data" panel is the precedent for a scroll
  box that is a tab stop.

## Out of Scope

- Scrolling in the editing mode, by wheel, touch or keyboard.
- A cut line, a fade or a marker for content beyond the size.
- A DEV warning for content taller than its size: a scroll is an intended outcome.
- A height that follows the content: ADR-0064 keeps it "not yet" for the list form.
- The widget's pixel size in its render prop, and loading and empty states: the map's ticket "Loading,
  empty and filling the parent".
- `overscroll-behavior` or any scroll chaining rule. The browser's default stands.

## Further Notes

- On macOS with overlay scrollbars, an author may not see that a body scrolls until they scroll it. Nothing
  is lost to the reader, so this is accepted rather than marked.
- Headless Chromium hides scrollbars, so a screenshot does not show whether a body scrolls. The fit check is
  what holds the examples.
