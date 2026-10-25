# The dashboard's small wishes: a heading level, options over their defaults, three recipes

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "Calculation, dashboard and operator-screen wishes"
(`.scratch/after-shakedown/issues/24-calculation-dashboard-and-operator-screen-wishes.md`; its Answer holds
every decision below that is not marked *(agent)*); findings `.scratch/shakedown/dashboard.md` 2, 3 and its
wishes, `audit-family.md` 7 and its wish "Widget chrome"; ADR-0064, ADR-0032, ADR-0035.

## Problem Statement

Five small things stand between an application and a dashboard that fits its page and survives its updates.

- **The outline is wrong.** Every widget title is a fixed `h2`, and so is the heading widget. A dashboard
  under a page's own `h2` gives its widget titles the page's level. A heading widget structures nothing,
  because the titles under it stand at its level.
- **A type's new option breaks a kept arrangement.** A widget type that gains an option in an update meets
  kept arrangements whose widgets lack it. The content receives the stored options as they are, and the new
  key is `undefined`. A widget whose options went missing altogether stays broken until a reader edits it.
- **The README says the opposite of what the dashboard does.** It says that a widget of a type that is gone
  "falls out". Since the shakedown's defects were fixed, such a widget is not drawn but stays in the stored
  arrangement through "Done". An application that wants to hide a widget from a role without losing it
  reads the README and gives up.
- **Three wishes have an answer in a few lines that stands nowhere.** Hiding a widget by role, migrating a
  stored arrangement of an older shape, and a row of the application's own controls in a widget. The
  shakedown wrote about 10 and about 25 lines of its own for the first two and did not find the third.
- **Four "not yet, or never?" questions have no written answer.** Uncertainty propagation in a calculation,
  a mimic or P&ID layer, dragging from the catalogue and a head slot were decided "never". A request for
  them should be answered by an ADR, not by a discussion.

## Solution

- **`headingLevel` on `Dashboard`**, 2 to 6, default 2, as core's `Accordion` names it. The heading widget
  stands at that level. Widget titles stand one level below it when the view holds a heading widget, and at
  it when not.
- **A stored widget's options are read over its type's `defaultOptions`**, shallowly. A key the type gained
  has its default, and a widget without options shows the type's.
- **Three examples on the dashboard's page:** hide a widget by role, migrate a stored arrangement, and a
  toolbar row at the top of a widget's content.
- **The README's sentence on a kept arrangement is corrected.** A widget of a type not declared is kept, and
  options a stored widget lacks come from its type.
- **The "never" lines are written.**
  - ADR-0032 gets uncertainty propagation in a new section "The calculation", and a mimic or P&ID layer
    under "Everywhere".
  - ADR-0064's "dragging from the catalogue to a chosen place" moves from "not yet" to "never".
  - ADR-0064's own "falls out" sentence is amended as the README's is.

Not built, and said so: a version field or a `migrate` hook for stored arrangements, a head slot, a hiding
feature, a drag from the catalogue. The lock is its own spec, `.scratch/dashboard-locked-widget/`.

## User Stories

1. As an application developer whose dashboard stands under a page heading `h2`, I want to give the
   dashboard `headingLevel={3}`, so that the page's outline has the dashboard's titles under the page's
   section.
2. As a screen reader user, I want the heading widgets of a dashboard one level above the widget titles,
   so that I can jump from section to section and then into a section's widgets.
3. As a screen reader user on a dashboard without heading widgets, I want the widget titles at the
   dashboard's level, so that no level of the outline is skipped.
4. As an application developer, I want the heading level to change nothing a reader sees, so that the
   outline and the look stay independent, as core's `Heading` keeps them.
5. As an application developer who leaves `headingLevel` out, I want the outline to be what it is today
   for a dashboard without heading widgets, so that my page does not change on an update.
6. As an application developer, I want a widget type that gained an option in my update to show that
   option's default in every kept arrangement, so that my content never meets `undefined` for a key it
   declares.
7. As an application developer, I want a kept widget whose options are missing or are no object to show
   its type's default options, so that one bad stored value does not break the widget until a reader
   edits it.
8. As an application developer, I want the options a reader set to win over the defaults, key by key, so
   that the merge never undoes a reader's choice.
9. As an application developer, I want the hook's `view`, the content, the title and the form to read the
   same merged options, so that the widget, its title and its form never disagree.
10. As an application developer, I want the merged options to be what "Done" reports after a change, so that
    my storage catches up with the new keys without a migration of my own.
11. As an application developer, I want a widget of a type I did not declare to keep its options as stored,
    so that a type I declare again later finds them untouched.
12. As an application developer, I want an example that hides a widget from a role by not declaring its
    type for that role, so that I see that a reader of another role never loses it.
13. As an application developer, I want the README to say that a widget of a type not declared stays in
    the stored arrangement, so that I can rely on it for roles, flags and plugins loaded late.
14. As an application developer, I want an example that keeps a version beside the stored arrangement and
    migrates an older shape before `initialView`, so that I can change my own storage format without a
    hook from the library.
15. As an application developer, I want that example to say which changes need no migration of mine, a
    new option, a size no longer offered and a type that is gone, so that I write one only when it is
    needed.
16. As an application developer, I want an example of a widget whose content starts with a row of its own
    controls, so that I can offer a period switch or a filter inside a widget without a head slot.
17. As a reader arranging the dashboard, I want such a control row to rest with the rest of the content,
    so that arranging is never mistaken for using.
18. As the maintainer, I want ADR-0032 to answer "uncertainty propagation" and "a mimic layer" with
    "never" and an *Instead*, so that a request is answered by the record.
19. As the maintainer, I want ADR-0064 to answer "drag from the catalogue" with "never" and the way that
    already works, so that the line no longer reads as a promise.
20. As a reader of the demo, I want the dashboard's page to list what is not built yet and what never
    will be as the ADRs do, so that the page and the record agree.

## Implementation Decisions

- **`headingLevel?: 2 | 3 | 4 | 5 | 6`** on `DashboardProps`, default 2, documented as core's `Accordion`
  documents its own.
  - The heading widget stands at the level.
  - A widget title stands one level below it when the view in view holds a heading widget, and at the level
    when not. *(agent)*: "the view in view" is the drawn one, the draft in the editing mode. Adding the first
    heading widget in a draft moves the titles down at once, and undo moves them back.
  - *(agent)*: one below 6 is 6. A dashboard at level 6 with heading widgets has heading widgets and titles
    at the same level. HTML has no seventh level, and an outline that deep is no page umriss serves.
  - The look does not change: the heading widget keeps its size, and a title its type.
  - The catalogue's drawer keeps its own heading, which stands in a dialog and not in the page's outline.
- **The demo uses the prop where the page puts the dashboard.** An example stands under the shell's `h3`,
  so its dashboard takes `headingLevel={4}`. The scenario stands under an `h2`, so its dashboard takes
  `headingLevel={3}`.
- **The options are read over the defaults.** The reading of a stored arrangement against the declared
  types, the one that already drops unknown entries and falls back to a starting size, also merges the
  options.
  - When the type's `defaultOptions` is a plain object, a stored plain object is spread over it, one level
    deep. *(agent)*: stored options that are absent, `null`, an array or a primitive read as the defaults.
  - *(agent)*: when `defaultOptions` is no plain object, stored options stand as they are, and only absent
    options read as the defaults.
  - Widgets of a type not declared are not read and keep their options as stored.
  - *(agent)*: the merge is part of the reading and of nothing else. The hook's `view`, the content, the
    title, the form and the draft all see merged options. "Done" reports them when something changed. A
    reading that only added defaults is no change and reports nothing.
  - The doc comment of `defaultOptions` says that a stored widget's missing keys are read from them, so
    `API.md` says it.
- **No version field and no `migrate` hook.** The stored value is the application's (ADR-0064). The example
  shows the application's own `{ version, view }` and a migration before `initialView`. A change to umriss's
  own format falls under the upgrade promise (`.scratch/upgrade-promise/`).
- **No hiding feature.** The application declares a type for the roles that may see it. The example puts
  the declaration behind a condition, and the README says that the widget stays in the stored arrangement.
  Done keeps it after the widgets that are drawn, so it comes back at the end. The example says so.
- **No head slot.** The head is the grip, takes the arrow keys and carries the one menu (ADR-0064). The
  application's controls stand at the top of the content, which is inert in the editing mode.
- **The ADR lines** are dated amendments, in the words given in the docs ticket. ADR-0032's status line is
  not changed, so that the tickets of other specs that touch it do not collide. *(agent)*: ADR-0064's
  "a widget of a type that is gone falls out" gets the same correction as the README, since the docs
  ticket edits ADR-0064 anyway. The "not yet" line on locking stays until the lock is built: its spec,
  `.scratch/dashboard-locked-widget/`, writes "taken" when it ships.
- **The changelog.** The heading level is "Added". The options merge is "Changed", with the migration line
  that an application that merged the defaults itself may drop that code.

## Testing Decisions

- A good test here asserts on what a reader or an assistive technology meets: heading roles and their
  levels, the text a widget shows, what `onViewChange` receives. It never asserts on class names or the
  module's state.
- **The heading level** is a unit test beside the dashboard's existing ones. With and without heading
  widgets, at the default and at 3 and at 6, and in a draft where a heading widget is added and undone, it
  asserts on the levels of the heading roles.
- **The options merge** is a unit test beside the stored-arrangement tests. A kept widget lacking a key, one
  without options, one with options of the wrong kind and one of a type not declared. It asserts on what
  the content shows, on the hook's `view`, and on what "Done" reports after one move.
- **The examples** are proved by the demo's own checks. The smoke test renders every example, the
  screenshot suite takes a picture of each (new baselines, looked at), and the accessibility suite runs
  axe on the page.
- Prior art: the dashboard's stored-arrangement tests (a harness with `initialView`, `onViewChange` spied
  on), its lenient-reading tests, and core's `Accordion` tests of `headingLevel`.

## Out of Scope

- A `version` field, a `migrate` option, or a schema of umriss's own for stored arrangements.
- A hiding feature, a `hidden` flag on a widget, or "hiding a widget that has nothing to show" (ADR-0064
  keeps that one "not yet").
- A head slot, or any content of the application's in a widget's head.
- Dragging from the catalogue. Focus moving to a widget just added belongs with the dashboard's focus
  defects (`dashboard.md` 9, `audit-family.md` 7), a triage of its own.
- A deep merge of options, or a merge for widgets of types not declared.
- The lock: `.scratch/dashboard-locked-widget/`.
- The calculation's print share: roadmap P3 (`.scratch/open-points-roadmap/`). The calculation's example of
  a total over rows that have a value, and a mimic in core's kiln scenario, are not part of this spec.

## Further Notes

- The heading-level ticket waits on the root contract's dashboard ticket, since both edit `DashboardProps`
  and the same generated `API.md`. Only the declaration is shared; if that wait is long, the order can be
  turned around and the root contract's ticket rebased instead.
- The README's ticket waits on the README tickets of `.scratch/scroll-in-a-widget/` and
  `.scratch/views-in-their-frame/`. The latter writes its lines beside the same bullet ("A kept
  arrangement is read leniently").
- ADR-0032 is also amended by `.scratch/table-columns-from-the-data/` (its pivot item) and by
  `.scratch/chart-picture-and-print/` (its status line and export point). The docs ticket adds a section and
  an item and leaves those places alone, so the three can land in any order.
