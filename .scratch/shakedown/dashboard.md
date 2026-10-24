# Shakedown: @umriss-ui/dashboard 0.40.4

Status: needs-triage

A Vite 8 host (TS strict, `skipLibCheck:false`) with core, charts and dashboard from the packed tarballs,
real `useChart` charts and core `Stat`s in the widgets, Chromium and WebKit, 2026-10-24. Core's known
findings are in `core.md`, cross-package ones in `cross-package.md`. ✓ = confirmed by the coordinating
session.

## Findings

1. **[Break] A suspending widget blanks the whole dashboard.** The `Failed` boundary around each widget
   catches throws only; there is no per-widget `<Suspense>` (none in the package). A widget with
   `React.lazy`, `use(fetch)` or a Suspense data library replaces every widget with the app's fallback,
   or suspends the root.
2. ✓ **[Break] A malformed stored view crashes the page.** `readView` (`model.ts:33`) calls
   `view.widgets.flatMap` unguarded: `{}`, `{widgets:null}`, `{widgets:"x"}`, `[]`, `5`, `{widgets:[null]}`
   and an older shape such as `{version:1,items:[…]}` all throw. A widget without `id` breaks moving. There
   is no version field and no migration hook.
3. ✓ **[Break] Done deletes widgets the app does not know right now, permanently.** `leave()` in
   `useDashboard.ts` saves the draft, which started from `read(view)` with unknown types already dropped.
   One move and Done, and a widget behind a feature flag or a role, a plugin not loaded, or another user's
   widget is gone from storage. Idea: keep unreadable widgets in the stored view, or report them.
4. **[Break] `onDraftChange(false)` never fires on unmount:** after a route change mid-edit the app's
   "unsaved" flag stays true; the draft itself is lost silently.
5. **[Misfit] A throwing widget shows a fixed sentence**, with no retry and no `onError` for Sentry and the
   like; a widget whose `options` went missing after an update stays broken until edited.
6. **[Look] The README's own example clips:** `small` (3×2) with a core `Stat` is cut by 15 px (21 px in
   edit mode). A chart with `height={260}` in a three-row widget loses 132 px with no axis and no scroll.
   The docs' `height:100%` recipe works.
7. **[Look] Below 756 px of container width the board is one column**, so "twelve columns that never change
   in number" holds only above it; `small` stays 112 px tall there. Edit controls on a phone are 24×26 px.
   At 2560 px the grid is left-aligned at 1560 px, 976 px empty on the right.
8. **[Look] The size label in edit mode fails contrast** (axe, 5 nodes light, 4 dark): core B5 again.
9. **[Misfit, a11y] Focus drops to `<body>` after Edit and after Done.** A widget head is a `role=group`
   with no hint that the arrow keys move it; ArrowUp/Down move by one place, not one row.
10. **[Misfit] Two tabs: the last Done wins**; the other tab keeps its own view (no `storage` listener;
    storage is documented as the app's).

## Wishes

- **Hide a widget from a user without losing it from the stored view.** Workaround: none (about 10 lines
  plus own filtering would be needed). Elsewhere: Grafana panel permissions, Backstage, Retool. Unlisted.
- **A schema version and migration for stored views.** Workaround: about 25 lines. Elsewhere: redux-persist
  `version`/`migrate`, Grafana `schemaVersion`. Unlisted.
- **Per-widget loading and error reporting with retry.** Workaround: about 15 lines, a Suspense and an error
  boundary inside every widget. Elsewhere: react-error-boundary (`onError`, `resetErrorBoundary`). Unlisted.
- **Content that scrolls in its widget.** never: ADR-0064 ("height follows the size, never the content").
  For a chart the documented `height:100%` recipe **holds** (3 lines, nothing cut). For a scroll box it
  **fails**: outside edit mode it scrolls, but in edit mode the body is `inert`, so the reader cannot look
  at a table widget's rows while deciding where it goes. Idea: keep wheel and touch scrolling alive in edit
  mode, or show the size's cut line.
- **Lock a widget; drag from the catalogue to a chosen place.** Gave up. Elsewhere: react-grid-layout
  `static`, Gridstack drag-in. not yet: ADR-0064. The package ships no `docs/capabilities.md`.

## Held up

A removed type, a size no longer offered, a duplicate id, a stored "gigantic" size fall out or fall back
without a crash · keyboard move, undo/redo, cancel, mouse drag in both engines; a touch drag reorders · a
widget updating every 500 ms keeps the head's focus and does not break a drag · core Modal and Menu inside a
widget work; in edit mode the body is `inert`, so nothing in it starts a drag · 60 widgets: edit mode in
about 200 ms · root 24 px without clipping · long titles ellipsise · German and dark mode right · the
sidebar collapse switches 1↔12 columns via the container query · move announcements correct · StrictMode clean.
