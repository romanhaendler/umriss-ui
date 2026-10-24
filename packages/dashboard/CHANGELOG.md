# Changes to `@umriss-ui/dashboard`

This document describes what changes for **callers** of the package: exports,
props, behaviour.

**The numbers.** The middle digit rises when something is added; the last one
when something is repaired. As long as the first digit is `0`, no number
promises compatibility — which is why a rule stronger than the figure applies as
well: **whatever changes existing behaviour stands under a heading "Changed" of
its own**, no matter which digit rose. Whoever reads only one section before an
upgrade reads that one.

The dashboard joins the other five packages' one number at its first version: they are released together, and a package without a change of its own still gets a heading for it.

## 0.41.0 – Stored views that never crash, and widgets that wait alone (Oct. 2026)

### Fixed

- **Any stored value is read without throwing.** A view of another shape - `{}`, `null`, an older format, widgets without an id - fell over in the reading; it now falls back to the default view where it cannot be read.
- **Done keeps the stored widgets of types not declared now.** A widget behind a feature flag or a role, or of a plugin not loaded, was dropped from the stored view on the reader's next Done - permanently. It now stays where it stood.
- **A widget that suspends shows a Skeleton in its own body** while the other widgets stay; before, one lazy widget replaced the whole dashboard with the application's fallback.
- **A calculation inside a widget is laid out right:** the dashboard's private custom properties carry its name (`--_dashboard-…`) and no longer reach into what a widget holds.

## 0.40.4 – A larger font keeps its rows (Oct. 2026)

### Fixed

- **The row unit's default grows with the reader's font size**: 50 px at the default size, more above it, rounded to whole pixels. At a browser font size of 200 %, widgets cut their content. `--u-dashboard-row` keeps its name; a theme that sets it keeps its value.

## 0.40.3 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.40.2 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.40.1 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.40.0 – The first version (Oct. 2026)

### Added

- **`useDashboard`** takes the arrangement the application gives a reader (`defaultView`) and the one the reader kept (`initialView`, read once), and hands back `Dashboard`, `WidgetType`, the view, `setView` and the editing actions. A view is a sequence of widgets, each with its type, its size and its options.
- **`WidgetType`** declares a widget type as JSX: its name, a sentence, the sizes it offers with the columns and rows each takes, the size to start from, its default options, an optional form for them and its content as a function of the size and the options. The options type is inferred from the default options. **`HeadingType`** is a built-in type that divides the dashboard with a title across the full width.
- **Twelve columns at every width.** The widgets are packed in the stored order, each at the first place at or after the one before it; the room left behind stays free. Under a maximum width the dashboard stops growing, and below the width at which a column would be too narrow to read it is a list in the same order. Decided on the dashboard's own width, so the server's markup is right.
- **Editing as a draft.** "Edit" opens the mode; one menu on every widget moves, sizes, sets the options and removes it; the head takes the arrow keys, Home and End, and is the grip for a pointer drag; "Add widget" opens the catalogue. Every change is a step of the draft with Undo, Redo and Reset to the default; "Done" reports the whole arrangement once through `onViewChange`, "Cancel" puts it back, and `onDraftChange` says while a draft is open. `allowEdit` forbids it. Every change is announced, in English and German.
- **A kept arrangement is read leniently:** a widget of a type that is gone falls out, a size its type no longer offers falls back to its starting size. A widget whose content throws keeps its frame, says so in one sentence and can still be moved and removed.
