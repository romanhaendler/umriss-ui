# 02 - A view survives JSON, and an example keeps it in the URL

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/table-small-wishes/spec.md`, "A view that survives JSON"

## What to build

A developer stores `t.view` as JSON and hands it back after a reload. The date filter comes back with it, and
`t.view` holds a `Date` again.

- **Reading a condition in.** One function, used for `initialView` and `setView`, at the place where a
  condition first meets its registered column. A string in the form `toISOString` writes is read as that
  `Date`:
  - as a bound of a range condition, on any column;
  - as a value of a list condition, on a column whose values are points in time.

  Any other string stays as it is. A range bound that is still text after this is foreign and warns once,
  as today.
- **Out.** `t.view` and `onViewChange` hold the `Date`. A `setView` of a parsed view equal to the one shown
  changes nothing, by the content comparison that exists.
- **Not touched.** `setFilter`, row filters and filters of one's own receive their conditions as given.
- **The example** "Keep the view in the URL" on the View page:
  - `onViewChange` writes the view as JSON into a query parameter with `history.replaceState`;
  - `initialView` reads it at mount;
  - `popstate` calls `setView`;
  - the example starts with a date range filter set, so the round trip shows the date coming back.

  Its lead says that no JSON compare is needed, because `setView` compares by content, and that the
  example uses a query parameter because the demo's hash is its router. The example passes the shell's page
  rules.
- **Docs.** The View page's text and the README's view paragraph say that a view survives JSON, and what
  is read back as a date. `API.md` is regenerated if a first sentence changed.

## Acceptance criteria

- [ ] Pure tests of the reading-in:
  - a range of two JSON dates becomes two `Date`s;
  - a list of JSON dates on a date column becomes `Date`s;
  - a list of ISO-looking text on a text column stays text;
  - `"2026-03-17"` and a malformed string stay strings.
- [ ] Mounted tests in `initialView.test.tsx`:
  - a view with a date range and a date list, through `JSON.stringify` and `JSON.parse`, into `initialView`,
    filters the same rows as the original, and `t.view` equals the original by content and holds `Date`s;
  - the same through `setView` after mount;
  - a `setView` of the parsed view of the view shown reports nothing through `onViewChange` and changes no
    state;
  - no development warning for the revived conditions.
- [ ] A browser test: in the URL example, set a filter, reload, and the filter and its rows stand.
- [ ] The demo smoke test renders the new example.
- [ ] `pnpm check table` and `pnpm check:site` pass.
- [ ] The changelog notes under Fixed that a stored view keeps its date conditions.
