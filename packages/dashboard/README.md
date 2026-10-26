# @umriss-ui/dashboard

A React dashboard for the start screen of a data-dense application: widgets a
developer declares and a reader arranges. The arrangement is a sequence, each
widget at one of the sizes its type offers, packed in the stored order on
twelve columns that never change in number. The reader edits it in a mode, as a
draft with undo that is kept or discarded as a whole; the application keeps the
result and supplies the arrangement a reader starts from.

## Install

```bash
pnpm add @umriss-ui/dashboard @umriss-ui/core
```

`@umriss-ui/core` is a **peer dependency**: the dashboard takes its styling
regime, its frames, menus and drawer, its wording and its announcements from
there. React 19 or newer as a peer as well. TypeScript 5.4 or newer (the declarations use `NoInfer`). The dashboard depends on `core`
alone; nothing depends on the dashboard, and it takes no chart, table or
schedule - what stands in a widget is the application's.

The package ships ES2022 syntax; an application that serves older browsers
transpiles it itself.

Every entry begins with `"use client"`, the directive a framework with Server
Components reads to treat a module as client code. A dashboard is declared by its hook,
`useDashboard`, so the declaration lives in a Client Component file: a Server Component renders that
file and hands it the data its widgets show. The dashboard renders to a string on the server and in
a test, without a layout engine.

## Declared like a table

`useDashboard` takes the arrangement the application gives a reader and hands
back `Dashboard` and `WidgetType`. A widget type is JSX: its name, a sentence,
the sizes it offers with the columns (of twelve) and rows each takes, the size
to start from, its default options, and its content as a function of the size
and the options. The options type is inferred from the default options.

```tsx
import { Stat } from "@umriss-ui/core";
import { useDashboard } from "@umriss-ui/dashboard";

const { Dashboard, WidgetType } = useDashboard({
  defaultView: { widgets: [{ id: "a", type: "figure", size: "small", options: { name: "Orders" } }] },
  initialView: kept,
  onViewChange: (view) => save(view),
});

<Dashboard aria-label="Dispatch, today">
  <WidgetType
    name="figure"
    label="Figure"
    sentence="One number."
    sizes={{ small: { columns: 3, rows: 3 }, medium: { columns: 4, rows: 3 } }}
    start="small"
    defaultOptions={{ name: "Orders" }}
  >
    {({ options }) => <Stat label={options.name} value={1284} />}
  </WidgetType>
</Dashboard>;
```

`Dashboard` is an element: `ref`, `className`, `style` and the rest reach its root `role="group"`.

- **A sequence, never coordinates (ADR-0064).** One stored arrangement is right
  at every width. A widget that does not fit its row starts the next, and the
  room it leaves stays free. Below the width at which a column would be too
  narrow to read, the dashboard is a list in the same order. Dense packing,
  stacks of widgets sharing a place and a layout per breakpoint are not built.
- **Sizes have names.** `small`, `medium`, `wide`, `tall`, `large` and `full`,
  worded in English and German by the library; a type offers some of them. The
  height follows the size, never the content: what the content needs beyond
  the size scrolls inside the widget, and the keyboard reaches it.
- **A view fills its widget's body.** A chart and a schedule fill the body and
  need no height of their own; a table stays within it, its toolbar and pager
  in view, and its rows scroll. A wrapper of the application's own between the
  body and the view passes the height on with `height: 100%`. A view whose floor
  is taller than a size (a chart's 300 px, a schedule's 400 px) takes a lower one
  through `style`'s `minHeight`, as the dispatcher's trends do.
- **Editing is a mode and a draft.** "Edit" opens it; every change is a step
  that can be undone and redone; "Done" reports the whole arrangement once
  through `onViewChange`, "Cancel" puts it back, "Reset" steps to the default.
  `onDraftChange` tells the application while a draft is open, to warn before
  navigation.
- **Every action without a drag.** One menu on every widget's head moves,
  sizes, sets the options and removes; the head is also the grip for a pointer
  and takes the arrow keys. Every change is announced.
- **A locked widget moves and nothing else changes it.** The application sets
  `locked: true` on a widget of the view; the reader can move it, but not
  resize it, change its options or remove it, and the editing mode says so on
  its head and in its menu. The mark lives in the view, so it comes back through
  `initialView` and "Reset" brings back the default's. Only the application sets
  it; the reader never can. An arrangement a reader kept before the lock lacks
  it: the application sets it before `initialView`, as the demo's "A widget every
  reader keeps" shows.
- **A kept arrangement is read leniently.** A widget of a type that is gone
  falls out, a size a type no longer offers falls back to its starting size.
  A widget whose content throws keeps its frame and says so in a sentence.
- **A failed widget is reported and may be retried.** React's `onCaughtError`,
  given to `createRoot` or to the application's root, receives the error of a
  widget whose content throws; the other widgets render. A retry is an error
  boundary of the application's own inside the content: it catches first, so the
  dashboard's boundary never sees the error, and it can reset the application's
  data layer. Without one, a widget gets another try by itself when its size or
  its options change.
- **The application's, not the library's:** where an arrangement is stored,
  which default a role gets, several dashboards, sharing, and what stands in a
  widget.

## Testing

Tested under Vitest 5 and Jest 30 on jsdom. The runner lines and the setup file are in
[`@umriss-ui/core`'s Testing section](../core/README.md#testing); `check:dist` runs a test of the
installed dashboard (a widget and its title) with exactly those files.

## Documentation

The demo is the documentation; in a checkout, `pnpm dev:dashboard` (port 4178)
opens it. Its pages show running examples with their
source and the props table generated from `src/`, each prop linked to the
examples that show it; the scenario walks through a dispatcher's start screen
at other widths, while it is rearranged, when something goes wrong and what the
application governs. An API index lists every export, one search finds across
all six packages, and the header switches the examples to German. What is not
built yet and what never will be stands in ADR-0064. The vocabulary - dashboard,
widget, widget type, widget size, options, catalogue - stands in `CONTEXT.md`
under "Dashboards". Every export is listed in [API.md](API.md).

For a coding agent the demo stands as one Markdown file inside the installed
package, `docs/llms-full.md`, pinned to that version. The running documentation of a version is opened as [the repository README describes](https://github.com/romanhaendler/umriss-ui#see-it-running): check out the tag `<package>-v<version>`, then `pnpm start`.
