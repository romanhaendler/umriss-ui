# 04 - The dashboard's README says what fills a widget and who hears of a failure

Status: ready-for-agent
Type: task
Size: S

Blocked by: `01-a-table-stays-within-its-frame.md`, `02-a-schedule-fills-its-frame.md`,
`.scratch/scroll-in-a-widget/issues/02-content-taller-than-its-size-scrolls-in-its-widget.md`
Spec: `.scratch/views-in-their-frame/spec.md`

## What to build

No new API. The dashboard's README tells an application how each view sits in a widget, and what becomes of
a widget that throws. A unit test holds the second.

- **Beside "the height follows the size, never the content"** (whose second half the scroll ticket writes),
  in a few lines:
  - a chart and a schedule fill the widget's body, and a table stays within it, with toolbar and pager in
    view; none needs a height;
  - a wrapper of one's own between the body and the view passes the height on with `height: 100%`;
  - a view whose floor is taller than a size (a chart's 300 px, a schedule's 400 px) takes a lower one
    through `style`'s `minHeight`, as the dispatcher's trends do.
- **Beside "a widget whose content throws keeps its frame and says so in a sentence":**
  - the error reaches React's `onCaughtError` on the root, where an error reporter is attached;
  - a retry is an error boundary of the application's own inside the content, which takes over from the
    dashboard's and can reset the application's data layer;
  - a widget gets another try by itself when its size or options change.
- **The unit test**, beside `suspense.test.tsx`: a widget that throws, under a root created with
  `onCaughtError`. The callback receives that error, and the widget keeps its frame and its sentence while
  the other widgets render.

## Acceptance criteria

- [ ] The unit test passes, and fails if the widget's boundary is replaced by a catch that does not go
      through React.
- [ ] The README says what is stated above and names no API that does not exist.
- [ ] `pnpm check dashboard` and `pnpm check:site` pass, and `API.md` is unchanged.
