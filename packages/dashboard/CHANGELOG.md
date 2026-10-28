# Changes to `@umriss-ui/dashboard`

This document describes what changes for **callers** of the package: exports,
props, behaviour.

**The numbers.** The middle digit rises when something is added; the last one
when something is repaired. The seven packages are released in step, and a rename
keeps its old name for one further minor, with a warning, before the minor after
it removes the name ([the upgrade promise, ADR-0066](../../docs/adr/0066-one-number-peers-over-the-minor-a-rename-lives-one-minor.md)).
**Whatever changes existing behaviour stands under a heading "Changed" of its
own**, no matter which digit rose, with a `Migration:` line. Whoever reads only
one section before an upgrade reads that one.

The dashboard joins the other five packages' one number at its first version: they are released together, and a package without a change of its own still gets a heading for it.

## 0.48.0 – Released in step with core (Oct. 2026)

No change of its own; the number moves with core's touch scale, now an opt-in (ADR-0079): a `md` control of core stays 32 px under a finger unless the application imports `@umriss-ui/core/touch-scale.css`.

## 0.47.1 – Released in step with the table (Oct. 2026)

No change of its own; the number moves with the table's repaired exports.

## 0.47.0 – Released in step with alarms (Oct. 2026)

No change of its own; the number moves with the new package `@umriss-ui/alarms`.

### Changed

- **The peer ranges move to `^0.47.0`.**
  - Migration: install the 0.47 version of `@umriss-ui/core` beside it.

## 0.46.0 – A locked widget, a heading level, and stored options (Oct. 2026)

### Added

- **`DashboardWidget` takes `locked`**, set by the application: the reader can move a locked widget but not resize it, change its options or remove it, and the editing mode says so on its head and in its menu. The lock lives in the view; an example shows how an application brings it into arrangements kept before it.
- **`headingLevel` on `Dashboard`** sets the level of its heading widgets (2 to 6, default 2); a dashboard that holds a heading widget has its widget titles one level below them.
- **The demo:** a widget for one role that survives "Done" by another, an arrangement migrated from an older release, and a row of the widget's own controls above its chart. ADR-0032 and ADR-0064 name a mimic layer, uncertainty propagation and dragging from the catalogue as never.

### Changed

- **A kept arrangement's widgets are read with their options spread over the type's `defaultOptions`**, one level deep, so a key a later update adds is never `undefined`; absent, `null`, array or primitive options read as the defaults, and a widget of an undeclared type keeps its options as stored.
  - Migration: an application that merged the defaults into stored options itself may drop that code.
- **The peer range on core moves to `^0.46.0`.**
  - Migration: install the 0.46 version of `@umriss-ui/core` beside it.

## 0.45.0 – Moves along (Oct. 2026)

No change of its own; the dashboard is released with the other five under one number.

### Changed

- **The peer range on core moves to `^0.45.0`.**
  - Migration: install the 0.45 version of `@umriss-ui/core` beside it.

## 0.44.0 – Moves along (Oct. 2026)

No change of its own; the dashboard is released with the other five under one number.

### Changed

- **The peer range on core moves to `^0.44.0`.**
  - Migration: install the 0.44 version of `@umriss-ui/core` beside it.

## 0.43.0 – What fills a widget (Oct. 2026)

### Added

- **`Dashboard` takes a `ref`**, typed at its root `role="group"` (ADR-0068); at runtime it reached that element before.
- **The README says what fills a widget and who hears of a failure:** a chart and a schedule fill the body, a table stays within it with its toolbar and pager in view, a wrapper passes the height on with `height: 100%`; a widget whose content throws reaches React's `onCaughtError`, keeps its frame, and tries again when its size or options change.

### Changed

- **The peer range on core moves to `^0.43.0`.**
  - Migration: install the 0.43 version of `@umriss-ui/core` beside it.

## 0.42.0 – A widget scrolls what exceeds its size (Oct. 2026)

### Added

- **Loadable in Vitest and Jest** with core's lines: the `.` entry carries a `default` condition, the README's "Testing" section points at core's, and the release check runs a test of a widget under both runners.
- **The mode label reads core's `--u-transform-caps`.**
- **TypeScript 5.4 or newer**, stated in the Install section (the declarations use `NoInfer`); the release check compiles a strict consumer under 5.4 as well as the current TypeScript.

### Changed

- **The peer range on core covers the minor: `^0.42.0`.** It named the exact patch before (`^0.41.1`), so npm refused an install beside an earlier patch of core with `ERESOLVE`; the six packages move under one number and a minor moves the range (ADR-0066).
  - Migration: nothing to change; any `@umriss-ui/core` 0.42 patch satisfies the peer.
- **Content beyond a widget's size scrolls inside its body**, on both axes, where it was cut. While it overflows, the body is a tab stop named by the widget's title, so the keyboard reaches what the wheel reaches; in the editing mode the body stays inert and keeps its scroll position (ADR-0064, amended).
  - Migration: nothing to change; a widget whose content was cut now scrolls - look at a size that was chosen too small, and at a test that tabs through the dashboard.
- **The editing mode keeps every body at its height.** The mode's band took about 4 px from each body, so content that fitted at rest was cut on "Edit"; a card's head now has one height at rest and in the mode, under any spacing tokens, and the band's controls are centred in it.
  - Migration: nothing to change; a screenshot of the editing mode moves by a few pixels.

## 0.41.1 – The documentation runs where the code is (Oct. 2026)

### Changed

- **The documentation is no longer hosted.** The site on GitHub Pages is gone, and the package's `homepage` now names its README on GitHub. The running documentation of this version opens from a checkout of the tag `dashboard-v0.41.1` with `pnpm install` and `pnpm start`, at `http://localhost:4170/umriss-ui/` - the repository README says how, under "See it running".
  - Migration: nothing to change; a bookmark or link to the old hosted site no longer resolves - open the documentation from a checkout of the tag, as described above.
- **`docs/llms-full.md` in the package stands on its own:** a link to another page points at that page's heading in the same file, a link to a place on the site that the file does not hold keeps only its text, and ADR-0032 is linked at this version's tag.
  - Migration: nothing to change; look at any tool that read `docs/llms-full.md` and followed its links to the site, which now find the heading in the same file.

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
