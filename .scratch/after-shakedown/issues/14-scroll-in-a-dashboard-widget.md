# Scroll in a dashboard widget

Type:   grilling
Status: resolved

## Question

May a widget's content scroll inside its fixed height, also while the dashboard is being arranged?

ADR-0064: "the height follows the size, never the content". The documented `height: 100%` recipe holds for a
chart. A scroll box fails: outside edit mode it scrolls, but in edit mode the widget body is `inert`, so a
reader cannot look through a table widget's rows while deciding where it goes
(`.scratch/shakedown/dashboard.md`, "Content that scrolls in its widget"). A chart with `height={260}` in a
three-row widget loses 132 px with no axis and no scroll (`dashboard.md`).

- Keep wheel and touch scroll alive in edit mode (not `inert` for scrolling, yet nothing in it starts a drag),
  or show the size's cut line, or neither.
- Does ADR-0064 change in a sentence (content may scroll within the size), or does the recipe change?
- What tells an author that content is cut (a DEV warning, the size label)?

## Answer

Decided 2026-10-25 by the agent, under the maintainer's delegation. The two product calls are marked
*(agent, product - for review)*.

- **Content may scroll inside its widget's size; nothing is cut any more** *(agent, product - for review)*.
  The widget's body is the scroll box: `overflow: auto` on both axes, where it is `hidden` today. The height
  still follows the size, never the content. What the content needs beyond the size is reached by
  scrolling. It is never cut, and it never grows the widget. The `height: 100%` recipe stays the way a chart
  or a table fills its size, and a chart's floor (ADR-0050) now ends in a scroll, not in a cut. A scroll box
  the content brings itself keeps working, because content that fills the body gives the body nothing to
  scroll.
- **A scrolling body takes the keyboard** *(agent)*. While its content is taller or wider than the body,
  outside the mode, the body is a tab stop, named by the widget's title. When the content fits, it is no tab
  stop. This is the precedent of charts' "Show data" panel. The body is measured in the browser, and nothing
  changes on the server. A tab stop on every body would add one stop per widget for nothing. Without one,
  Safari's keyboard cannot scroll the body, and axe's `scrollable-region-focusable` fails.
- **In the editing mode the body stays `inert`** *(agent, product - for review)*. No wheel or touch scroll,
  and no cut line. The reader arranges by title, size and what the widget shows at rest, and reads further
  one "Done" away. The body keeps its scroll position through the mode. Keeping the scroll alive would mean
  a hand-built `inert`: every pointer, key and focus path blocked by hand except the scroll, under a head that
  is a drag grip with `touch-action: none`. Today's `inert` gives exactly "nothing in it starts a drag" for
  free.
- **The mode keeps the body at its height** *(agent)*. Today the head band and the body's padding take about
  6 px from the body in the mode (`dashboard.md` 6: 15 px cut at rest, 21 px in the mode). Under `auto`, a
  widget that fits at rest would then overflow on "Edit": a scrollbar appears and the content reflows. The
  band's extra room is found without taking it from the body.
- **What tells an author: the scrollbar, and a check for umriss's own examples** *(agent)*. There is no DEV
  warning: a scroll is now an intended outcome, and a warning would fire for every widget meant to scroll.
  The size label stays as it is. The demo's dispatcher example is held by a `@quick` check that each widget
  fits its body, at rest and in the mode. The README's example gets a size in which a core `Stat` fits. On
  macOS with overlay scrollbars, an author may not see that a body scrolls until they scroll it. Nothing is
  lost to the reader, so this is accepted.
- **ADR-0064 is amended, not replaced.** Its "the height follows the size, never the content" gets the
  sentence: what the content needs beyond the size scrolls inside the widget, and in the editing mode the
  content stands still. The amendment text is in the spec's ticket 02. A switch back to `hidden` later would
  cut content that applications rely on reaching. That costs more than a commit message, which is why the
  ADR is amended, but it needs no new ADR.
- **Out:** scroll in the editing mode; a cut line or fade; a DEV warning for content taller than its size; a
  height that follows the content (ADR-0064 keeps it "not yet" for the list form); the widget's pixel size
  in its render prop, and loading and empty states ("Loading, empty and filling the parent").
- **Touches:** `@umriss-ui/dashboard` only (its stylesheet, `Dashboard`, the dispatcher example, the README,
  the visual checks), and ADR-0064's text.
- **Becomes the spec** `.scratch/scroll-in-a-widget/`. It has two tickets: the mode keeps the body's
  height, then content scrolls in its widget.
