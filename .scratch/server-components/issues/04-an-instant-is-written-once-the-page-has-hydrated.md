# 04 - An instant is written once the page has hydrated

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-adr-and-what-each-readme-says.md`
Spec: `.scratch/server-components/spec.md`

## What to build

A page with a table of dates, rendered by a server in UTC and read in New York, hydrates without React's
error #418. Every date and time it shows is in the reader's zone. The server's markup holds no instant, so
no pair of zones can disagree.

- **Core's `useFormats()`.** Until the page has hydrated, it returns formats whose instant members write an
  empty string: `date`, `dateShort`, `month`, `dateLong`, `time`, `dateTime` and `offset`. After hydration,
  and from the first render under `createRoot`, it returns the language's formats unchanged.
  - "Hydrated" is read through `useSyncExternalStore`, with a server snapshot of false and a client
    snapshot of true. A hydration therefore renders once more right after, and a client-only render never
    sees the empty set.
  - The empty set is built once per format set, not per render.
  - The numbers, `count`, `percent`, `compareText` and `relative` are never touched.
  - A comment says why: the reader's zone is known only in the browser (ADR-0060, amended).
- **Every instant written during render goes through `useFormats()`.** Check the parts that show an
  instant on their first render:
  - core's four pickers with a value (`DatePicker`, `DateRangePicker`, `DateTimePicker`,
    `DateTimeRangePicker`), their fields and triggers;
  - the table's date column and its date conditions in the toolbar;
  - the schedule's summary.

  A part that formats an instant during render some other way (a module-level default format, say) moves
  onto `useFormats()`. Formatting inside an event handler or an effect stays as it is.
- **The README.** Core's "Server Components" section gets one sentence: on a server and until the page has
  hydrated, a date or time is empty, because only the browser knows the reader's zone. The paragraphs of
  table and schedule say the same in one clause.
- **Changelog:** core, a minor entry. Table and schedule follow with the core version they depend on.

## Acceptance criteria

- [ ] Core: `renderToString` of each of the four pickers with a value holds no formatted date or time.
      Hydrating that markup in jsdom raises no recoverable error, and the value's text shows afterwards.
- [ ] Table: the same for a table with a Date column. Its server test keeps every other assertion (headers,
      rows, numbers, the aggregate).
- [ ] Schedule: the server markup holds no formatted instant.
- [ ] A client-only render (`createRoot`, as in every existing unit test) shows dates in its first commit.
      The existing tests that assert a date stay unchanged.
- [ ] `pnpm check core`, `pnpm check table`, `pnpm check schedule`, `pnpm typecheck` and `pnpm check:site`
      pass. `pnpm test:visual:quick` passes for core, table and schedule; the demos are prerendered
      (ADR-0037), and their screenshots are taken after hydration.
