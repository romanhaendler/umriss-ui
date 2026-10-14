# Dashboard

Status: done
Date:   2026-10-14
Origin: grilling session of 13 and 14 Oct 2026; ADR-0064, which supersedes
ADR-0060's "never" for a dashboard a user arranges; research in
`docs/research/user-dashboards-2026-10/` (synthesis `report.md`); two throwaway
prototypes in `.scratch/dashboard/` on the local branch `prototype/dashboard`.

## Problem Statement

A reader of a data-dense application opens the same start screen every day,
and their work differs from their colleagues': one dispatcher watches backlog
and late deliveries, another complaints; a head of operations wants the week's
trend first. Today an umriss application can only show one arrangement the
developer laid out with `Grid`, `Stack` and `Splitter`. A reader who wants the
figure they look at fifty times a day at the top, a chart wider, or a list they
never read gone, has no way to say so.

The developer who wants to give them that has no good way either. ADR-0060
sent them to a grid library around umriss components, and the leading ones
store coordinates per breakpoint: an arrangement made on a laptop comes out
scrambled on a wide monitor and does not come back when the window narrows
again; none of them can move a widget by keyboard; and none knows umriss's
density, tokens or wording. The developer ends up building and maintaining a
layout editor of their own.

## Solution

A seventh package, `@umriss-ui/dashboard`, depending on `@umriss-ui/core`
only. A **Dashboard** shows **Widgets**, each an instance of a **Widget type**
the developer declares, at one of the **Widget sizes** that type offers. The
arrangement - which widgets, in what order, at which sizes, with which
**Options** - is the dashboard's **View**: the application supplies the one a
reader starts from, keeps the reader's own, and decides whether they may edit
at all.

The arrangement is a sequence, packed in order on a grid of twelve columns
that never change in number, under a maximum width. A widget that does not fit
its row starts the next; the room it leaves stays free until the reader fills
it. On every screen wide enough for the grid, each widget keeps its neighbours.
Below the width at which a column would be too narrow to read, the dashboard is
a list: one widget under the other, in the same order.

The dashboard stands still until the reader asks to edit it. In the editing
mode every change is a step of a draft that can be undone and redone; "Done"
reports the whole arrangement to the application once, "Cancel" restores it,
and "Reset" returns to the application's default as one more undoable step.
Each widget's head carries one menu that does everything without a drag -
move to the start, earlier, later, to the end, the sizes, its options, remove -
and is the grip for a pointer and the target of the arrow keys. Every change is
announced. A catalogue lists every widget type with its name, a sentence and
its footprint; choosing one adds it at the end, already showing something.

The library draws all of it - the editing bar, the menus, the catalogue, the
frames, the empty and failed states - with its wording in English and German.

## User Stories

### Reading

1. As a reader, I want my dashboard to open exactly as I left it, so that what I look for is where I remember it.
2. As a reader, I want the same arrangement on my laptop and on the wide monitor at my desk, with every widget beside the same neighbours, so that I do not search my own screen.
3. As a reader on a very wide monitor, I want the dashboard to stop growing at a sensible width, so that a single figure is not stretched across half a metre.
4. As a reader on a phone or in a narrow side window, I want the widgets one under the other in the order I chose, so that I can still read every one of them.
5. As a reader, I want a heading across the full width to divide my dashboard into parts, so that related widgets read as a group.
6. As a reader, I want a widget at a larger size to show more of the same thing - a trend beside the figure, more columns in a table - so that choosing a size is choosing how much I want to see.
7. As a reader, I want the widgets to work as usual outside the editing mode - a chart zooms, a table sorts - so that the dashboard is a working surface, not a picture.
8. As a reader, I want a widget whose content fails to keep its frame and say in a sentence that it cannot show anything, so that the rest of my dashboard keeps working.
9. As a reader who has never edited anything, I want a dashboard the application chose for my role, so that I get a useful start screen without doing anything.
10. As a reader using a screen reader, I want the widgets in the document in the order I see them, so that reading order and visual order agree.

### Entering and leaving the editing mode

11. As a reader, I want an "Edit" button I can see without hunting for it, so that I find out that I can arrange my dashboard.
12. As a reader, I want the editing mode to look unmistakably different, so that I never move something by accident and always know when I can.
13. As a reader, I want "Done" to keep everything I changed, so that one press saves my work.
14. As a reader, I want "Cancel" to put everything back as it was before I began, so that trying something out costs nothing.
15. As a reader, I want "Undo" and "Redo" for each single step, so that a mistake after ten good moves costs one move, not eleven.
16. As a reader, I want "Reset" to bring back the arrangement the application gives my role, and to be able to undo that too, so that I can start over without fear.
17. As a reader who navigates away with unsaved changes, I want to be warned, so that I do not lose them by accident.
18. As a reader, I want a dashboard whose editing the application has locked to show no editing controls at all, so that I am not offered what I cannot do.

### Arranging without a drag

19. As a reader, I want one menu on every widget's head, so that every action for that widget is in one predictable place.
20. As a reader, I want "Move to start", "Move earlier", "Move later" and "Move to end" in that menu, so that I can arrange without dragging.
21. As a reader, I want the menu to tell me which place of how many the widget has, so that I know where it stands.
22. As a reader, I want to choose a size from the menu by name, each with how much of the width it takes, so that I can predict the result.
23. As a reader, I want to remove a widget from the menu without a confirmation dialog, so that tidying up is quick - undo is my safety net.
24. As a keyboard user, I want to focus a widget's head and move it with the arrow keys, Home and End, so that arranging is as fast for me as for a mouse user.
25. As a screen reader user, I want every move, resize, addition, removal, undo and reset announced with the widget's name and, for a move, its old and new place, so that I know what happened without looking.
26. As a touch user, I want the menu to do everything, so that I never have to drag on a small screen.
27. As a voice control or switch user, I want every action to be a single activation of a named control, so that I can arrange at all.

### Arranging by drag

28. As a mouse user, I want to take a widget by its head and drag it, so that I can place it where I see it.
29. As a mouse user, I want the other widgets to make room while I drag and a placeholder at the true size where the widget will land, so that I see the result before I let go.
30. As a mouse user, I want a click on the head to stay a click and only a real movement to start a drag, so that I do not move widgets by accident.
31. As a mouse user, I want Escape to cancel a drag and put the widget back, so that a drag I regret costs nothing.
32. As a mouse user dragging toward the top or bottom of a tall dashboard, I want the page to scroll with me, so that I can reach any place.
33. As a touch user, I want to scroll the dashboard by its widgets' bodies even in the editing mode, so that the dashboard does not trap my finger.

### Adding and configuring

34. As a reader, I want a catalogue with every kind of widget, its name, a sentence about it and how much room it takes, so that I can choose without trying each one.
35. As a reader, I want a widget I add to show something useful at once, so that I am never left with an empty box or a form before it works.
36. As a reader, I want an added widget to appear at the end, be brought into view and be announced, so that I find it and can move it where I want it.
37. As a reader, I want to add the same kind of widget twice with different options - two trends for two figures - so that one kind of widget serves several of my questions.
38. As a reader, I want to change what a widget shows from its menu, so that I configure it where I see it.
39. As a reader, I want the options I change to be part of the draft, so that "Cancel" and "Undo" cover them too.
40. As a reader of an empty dashboard, I want it to say so and point me to the catalogue, so that I know how to begin.

### The developer

41. As a developer, I want to declare a dashboard through a hook as I declare a table, a chart and a schedule, so that I already know how.
42. As a developer, I want to declare each widget type as JSX - its name, a sentence, the sizes it offers with the room each takes, the one to start from, its default options, its content for a size and the form for its options - so that a widget type is one place.
43. As a developer, I want the options of a widget type to be typed from its default options, in its content and its form, so that a wrong field is a type error.
44. As a developer, I want the size names to come from one closed set the library words in English and German, so that I never write labels for them.
45. As a developer, I want to pass the arrangement a reader starts from and the one they kept, and to be told once per "Done" with the whole arrangement, so that storing it is one write in my own storage.
46. As a developer, I want a kept arrangement read leniently - a widget of a type I removed falls out, a size a type no longer offers falls back to its default - so that a release never breaks a reader's dashboard.
47. As a developer, I want to know whether a draft is open, so that I can warn before navigation.
48. As a developer, I want the editing actions (edit, done, cancel, undo, redo, reset, open the catalogue) from the hook as well, so that I can put "Edit" in my own page header if I want.
49. As a developer, I want to switch editing off entirely, so that a wall screen or a shared overview cannot be changed.
50. As a developer, I want to choose which widget types appear in the catalogue, including the built-in heading, so that the reader is offered what makes sense here.
51. As a developer, I want the maximum width, the row unit and the gap as tokens, so that I style the dashboard the way I style everything else (ADR-0045).
52. As a developer, I want the dashboard to render on the server and in a test without a layout engine, so that it fits my existing setup.
53. As a developer, I want the dashboard's wording in the same `Wording` directory as everything else, so that one provider sets the language for all of it.
54. As a developer, I want what stands in a widget to be anything - a chart, a table, a calculation, my own component - so that the dashboard frames my content and does not limit it.
55. As a developer, I want `setView` to apply a whole arrangement without it being reported, so that I can load a colleague's arrangement or a role's default programmatically.

## Implementation Decisions

- **Package.** `@umriss-ui/dashboard`, the workspace's seventh package; peers `@umriss-ui/core` and React `>=19` (ADR-0062); no other dependency. It reaches core only by its public entry, as the table does (ADR-0016). Styles load themselves and touch nothing else (ADR-0021); tokens are the styling API (ADR-0045). Its demo is built from the shared shell (ADR-0020), addressed by path and prerendered (ADR-0037), and every export has a place on the site (ADR-0044).
- **Declaration.** A hook, `useDashboard`, takes the application's default arrangement, the reader's kept arrangement (`initialView`, read once and leniently, ADR-0047), `onViewChange`, whether editing is allowed, and a callback for whether a draft is open. It returns `Dashboard`, the part a widget type is declared with (`WidgetType`), the current view, `setView`, whether the mode is on, and the editing actions. The hook binds a widget type's options type to its content and form, as `useTable` binds rows (ADR-0017, ADR-0048). The exact names are settled while building and recorded in `API.md`.
- **The View.** An object, so that a level of groups can join it later without breaking what was kept. From prototype 2:

  ```ts
  type DashboardView = {
    widgets: ReadonlyArray<{
      id: string;          // unique within the view; the dashboard makes ids for added widgets
      type: string;        // the WidgetType's name
      size: WidgetSize;    // one of the closed set
      options: unknown;    // the type's own, typed through the hook
    }>;
  };
  type WidgetSize = "small" | "medium" | "wide" | "tall" | "large" | "full";
  ```

  `onViewChange` is called once per "Done" that changed something, with the whole view - the reader's act is "Done", not each step (ADR-0047's "reports what the reader did"). `setView` is not reported.
- **Widget sizes.** One closed set of names, worded by the library: `small`, `medium`, `wide`, `tall`, `large`, `full` (klein, mittel, breit, hoch, groß, volle Breite). A widget type offers a subset; for each, the columns (of twelve) and rows it takes; and one to start from. The menu lists a type's sizes by area, each with its share of the width ("¼ wide"). The content is told its size. The height follows the size and never the content, in both forms.
- **Packing.** Strict row-major order: each widget takes the first place at or after the place of the one before it where it fits; a widget wider than the columns takes them all. The drawn order is the stored order, and the DOM is written in it. From prototype 2, the rule:

  ```ts
  // cursor = index of the cell the previous widget was placed at (row * columns + col)
  for (const widget of widgets) {
    for (let i = cursor; ; i++) {
      const row = Math.floor(i / columns), col = i % columns;
      if (col + w > columns || !free(row, col, w, h)) continue;
      take(row, col, w, h); place(widget, row, col); cursor = i; break;
    }
  }
  ```

  It is the same rule as CSS grid's sparse auto-placement. The dashboard renders a CSS grid of twelve equal columns and fixed rows and places each widget on the lines the rule gives, so that the browser sizes the columns and the library decides the places.
- **The two forms.** Grid while a column is at least a minimum width (a design constant: about 52 px at the gap of 12 px), list below it, decided on the dashboard's own width, not the window's - a container query, so that the server's markup and the first frame are right without measuring. The list is the same order, one widget per row, each at its size's height.
- **Maximum width.** A token, defaulting to about 1560 px; the dashboard stands at the start of its container. The row unit (about 50 px) and the gap (12 px) are tokens too.
- **The frame.** Every widget stands in a frame of the library's - core's `Card` look - with a head carrying its title and, in the mode, the grip, the size name and the menu button. Each widget's content is wrapped in its own error boundary; a failed widget shows one sentence and keeps its head and menu. The built-in heading type is a frame without a body.
- **The editing mode.** Entered by "Edit", shown by at least two signs (the bar's label and a changed frame), and in it the widgets' bodies are inert. The draft is a history of whole arrangements: every action is a step; "Undo"/"Redo" move through it; any new step forgets the steps ahead; "Reset" is a step to the default; "Done" reports and leaves; "Cancel" leaves without reporting. Escape cancels a drag, not the mode. The draft-open callback is called on entering and leaving.
- **The menu.** One button per widget head, opening core's `Menu`: place (start, earlier, later, end, disabled where meaningless, with "place n of m"), sizes (only if the type has more than one), the options form (in a popover from the menu, if the type has one), remove. Focus returns to the menu button after an action.
- **Keyboard.** In the mode a widget's head is a tab stop named "<title>, place n of m"; all four arrow keys move it earlier or later, Home and End to the start and end. Each move is a step.
- **Announcements.** Through core's `announce()`: "<title>: moved from place n to place m of k", "<title>: size <name>", "<title> removed. Undo brings it back.", "<title> added, place k of k", undo, redo, reset, done, cancel. All in the `Wording`.
- **Dragging.** Pointer on the head only; `touch-action: none` on the head alone, so bodies scroll; a drag starts after a few pixels of movement. While dragging, the shown order is the one of all candidate orders (the widget at each place of the order the drag began with) whose packed picture puts the widget's corner nearest to where it is held - a function of the pointer alone, so it cannot oscillate. A placeholder at the true size marks the landing place; the others move to their places with a short transition (none under reduced motion). The page scrolls near the window's top and bottom edge. Dropping makes one step; Escape or a cancelled pointer makes none.
- **The catalogue.** Opened from the bar, in core's `Drawer`. One entry per type in the catalogue: name, sentence, a drawn footprint of its starting size, "Add". Adding appends the widget at its starting size with the type's default options, closes nothing, brings it into view and announces it. The application chooses which types the catalogue lists; the built-in heading type is one it can include.
- **Lenient reading.** `initialView` and `setView` drop widgets of unknown types and duplicate ids, and set a size the type does not offer to its starting size. Options are passed as they are; a type that needs to repair them does so in its content.
- **Locked.** With editing not allowed, the bar is not drawn, the mode cannot be entered and the hook's actions do nothing.
- **Empty.** A dashboard without widgets says so; in the mode it points to the catalogue.
- **Wording.** All visible and assistive strings as entries in core's `Wording` (English) and `GERMAN_WORDING`, beside the table's and the schedule's entries.
- **The workspace.** The package enters `pnpm check`, the visual configuration with its own demo port (the next free one after the five demos), `docs/README.md`'s map and CLAUDE.md's package list. Core's demo outline lines for `Grid` and `Splitter` that say tiles are not arranged by the user (ADR-0060) point to the new package instead.

## Testing Decisions

- **What makes a good test here.** It drives the dashboard as a reader or a developer would - presses the bar's buttons and the menu's items, focuses heads and presses keys, drags by the head - and asserts what a reader sees or hears and what the application is told: the order of the widgets in the document, the sizes shown, the announcement text, the view passed to `onViewChange`, whether a draft is reported open. It does not assert on internal state, class names or the history's shape.
- **Seam 1, the hook in jsdom.** `useDashboard` with a few widget types, rendered with Testing Library: editing mode on and off, every menu action and its announcement, keyboard moves, undo/redo/reset/cancel/done and the one report, options in the draft, lenient reading of a kept view, a widget that throws, locked, empty, the catalogue adding at the end, server rendering. Prior art: the schedule's `useSchedule.test.tsx`, `scheduleView.test.tsx` and `ssr.test.tsx`; the type tests in `types.test-d.tsx` for the options typing.
- **Seam 2, the demo in a browser.** Playwright against the package's demo pages, for what needs a layout engine: the same neighbours at 1280, 1920 and 2560 px, the maximum width, the list below the threshold, a drag by the head with the placeholder and the reported step, Escape during a drag, the page scrolling during a drag, a body scrolling on touch in the mode. Behaviour tests run once (light). Prior art: the schedule's `features-editing.spec.ts` and `features-keyboard.spec.ts`; plus the suites every package has - screenshots in both themes, forced colours, accessibility, own data, own base.
- **The one internal exception.** The packing rule and the nearest-place rule are pure functions with many cases that need no DOM; they are tested directly, as the schedule tests `snap` and `walk`. A browser test checks once that the library's placement equals what the grid draws.
- **The guards every package has.** Wording guard, style guard, shrink guard, `API.md` current (`pnpm check:site`).

## Out of Scope

- **Not yet (ADR-0064):** sections that wrap as a whole; dragging from the catalogue to a chosen place; a height that follows the content in the list form; hiding a widget that has nothing to show; locking a single widget or making one mandatory; a limit on the number of widgets.
- **Never (ADR-0064, ADR-0032):** stacks of widgets sharing one place; coordinates and free placement; a layout per breakpoint; dense packing.
- **The application's, not the library's:** where an arrangement is stored; roles and which default a reader gets; several dashboards, tabs between them and which one opens first; sharing an arrangement with colleagues (it is a value to copy); filters across widgets; what stands inside a widget; validation of a widget's options (ADR-0060).
- **Elsewhere:** time zones other than the reader's (ADR-0060).

## Further Notes

- The size names were the recommendation of the grilling (`small`, `medium`, `wide`, `tall`, `large`, `full`); for a chart "wide" (half) is narrower than "large" (two thirds), which the menu's order by area and the share beside each name are meant to absorb. If the first readers stumble on it, the names are the thing to change before 1.0 - they are stored, so after 1.0 they are not.
- Three behaviours were chosen by the prototypes, not by evidence, and are the first things to watch with real readers: making room while dragging rather than only marking the place; all four arrow keys meaning earlier or later; free room left free rather than filled.
- Prototype 2 (`PROTOTYPE-2-dashboard.html` on the branch `prototype/dashboard`) is the behaviour to match; its four guided cases are the acceptance walk. Prototype 1 (`PROTOTYPE-arrangement.html`, same branch) shows why the columns are fixed (neighbours kept at other widths). Both stay out of `main`.
- The research found that most readers keep the default and the rest change little: the default arrangement per role, the lenient reading and "Reset" are the parts most readers will meet; the editing mode is the exception above them.

## Comments

**Delivery report, 14 Oct 2026.** All eight tickets are built on the local
branch `worktree-dashboard-package`: `@umriss-ui/dashboard` as the seventh
package (port 4178), with `useDashboard`, `WidgetType`, the built-in
`HeadingType`, strict packing on twelve columns and the list below about
756 px, the editing mode as a draft with undo, redo and reset, one menu per
widget, the keyboard on the head, dragging by the head, the catalogue and
options forms, lenient reading and failed widgets, and the package named
wherever the workspace names its packages. A review on two axes (standards,
spec) was fixed in one pass: the heading has a head and a form, every view is
read leniently, the hook's actions announce themselves, a failed widget
retries, focus after removal, the size entries in the wording, core's tokens.

Checked: `pnpm check` for all packages, `pnpm check:site`, `pnpm typecheck`,
and the dashboard's browser suite in light and dark (Chromium; 39 passed),
core's Grid and Splitter page heads unchanged.

Open for the release: `packages/dashboard/CHANGELOG.md` needs a released
heading before `pnpm build:pages` can build the site, and the full visual suite
of all six demos runs before it. Firefox was not run (it cannot launch in a
background job).
