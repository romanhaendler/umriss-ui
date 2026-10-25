# 02 - Content taller than its size scrolls in its widget

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-mode-keeps-a-widgets-body-at-its-height.md`
Spec: `.scratch/scroll-in-a-widget/spec.md`

## What to build

The tracer bullet, end to end. Content that needs more room than its widget's size scrolls inside the
widget's body instead of being cut. The keyboard reaches it, and the editing mode keeps it still.

- **The body scrolls.** The widget body's overflow is `auto` on both axes, where it is `hidden` today.
  Content that fills its size with `height: 100%` fills it as before, without a scroll, and a scroll box
  the content brings itself stays the only one.
- **The tab stop.** Outside the mode, while a body's content is taller or wider than the body, the body is a
  tab stop: a group named by the widget's title, with its focus ring drawn inside it. When the content fits,
  the body carries none of these. The dashboard measures in the browser; it reacts to:
  - the body resizing;
  - its content resizing;
  - its content replacing its root elements, as when a Suspense fallback gives way.

  Nothing is measured on the server, and the server's markup is unchanged.
- **The mode.** The body stays `inert`, so it is no tab stop in the mode, and its scroll position is kept
  through "Edit" and "Done".
- **The example.** The dispatcher example's open alerts are more than the `tall` size shows, a realistic
  morning, and scroll. Every other widget in it fits.
- **The README.**
  - "The height follows the size, never the content" gets its second half: what the content needs beyond
    the size scrolls inside the widget.
  - The example's figure type gets sizes in which a core `Stat` fits, at rest and in the mode, measured in
    the browser.
- **ADR-0064** gets this amendment at the end of "What follows", dated the day of the change:

  > *Amended:* the height follows the size, and what the content needs beyond it scrolls inside the
  > widget's body, on both axes. It is never cut, and it never grows the widget. While the content
  > overflows, the body is a tab stop named by the widget's title, so the keyboard reaches what the wheel
  > reaches. In the editing mode the body stays inert and keeps its scroll position. The reader arranges by
  > title, size and what the widget shows at rest. Scrolling in the mode would need a hand-built inert under
  > a head that is a drag grip. A cut line and a warning for content taller than its size are not built:
  > a scroll is an intended outcome, not a fault.

- **The checks.** Two `@quick` checks in the dashboard's visual suite:
  - **The fit check.** In the dispatcher example, every widget except the open alerts has nothing to scroll,
    at rest and in the mode, at 1280 px and at 390 px.
  - **The scroll check.** The open alerts widget keeps its size's height. Its body scrolls to its last
    alert by wheel, and by Tab and the arrow keys. In the mode it can be scrolled by neither, and it stands
    at the position it had. A widget that fits is skipped by Tab.

## Acceptance criteria

- [ ] The fit check and the scroll check pass in Chromium and WebKit, and the scroll check fails against
      today's `overflow: hidden`.
- [ ] The accessibility suite passes on the dispatcher's page with the scrolling alerts. A body without its
      tab stop fails it (`scrollable-region-focusable`).
- [ ] The dashboard's server-render unit test still passes, with unchanged markup.
- [ ] The README and ADR-0064 say what is stated above. The README's example, pasted into the demo, fits at
      rest and in the mode.
- [ ] `pnpm check dashboard`, `pnpm check:site` and `pnpm test:visual:quick dashboard` pass, and `API.md`
      is unchanged.
- [ ] The changelog notes that content beyond a widget's size now scrolls instead of being cut.
