# 08 - Server search waits for a pause in typing

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01
Spec: `.scratch/table-server-mode-2/spec.md`, "A late answer and an error (T1)"; the decision is the map's
ticket 23 (`.scratch/after-shakedown/issues/23-the-tables-and-the-schedules-single-wishes.md`, its Answer)

## What to build

A user types "pump" into a server-mode table's `Search` and the server is asked once, not four times
(`.scratch/shakedown/table.md` 5, `audit-family.md` 8). The field shows each letter at once.

- **The pause.** In server mode, typing in `Search` reports its request after a fixed pause of 300 ms
  without a keystroke. The pause is not an option. *(agent: 300 ms)*
- **At once, as today.** The field, `t.search`, the view and `onViewChange` take the text at once, and the
  page goes back to one at once. The current request of ticket 01 is the new one at once, so with `answers`
  the table is busy during the pause, as it is for a late answer.
- **Without a pause.** These report at once, and a pending report goes with them, so that it never follows
  later:
  - Enter in the field;
  - an empty field, however it was emptied;
  - `t.setSearch` from the application;
  - any other change of the request during the pause (a sort, a page, a condition), which reports the
    request with the text typed so far.
- **The rest.** Unmounting drops a pending report. Strict Mode still reports once. An automatic table
  filters at every keystroke, as today.
- **No cancel token.** `answers` already keeps a late answer from showing. An abort is the application's:
  the server-mode example of ticket 01 gains an `AbortController` in its `onRequest`, which aborts the
  previous fetch, and its lead says why the table has no token.
- **Docs.** The README's server-mode section, the Server-mode page's text and the `Search` documentation
  name the pause and what reports at once. The changelog notes it under Changed: a server sees fewer
  requests.

## Acceptance criteria

- [ ] Mounted tests in `serverMode.test.tsx` with fake timers:
  - typing four letters reports one request, 300 ms after the last;
  - the field shows each letter at once;
  - Enter reports at once, and nothing follows after the pause;
  - emptying the field reports at once;
  - `setSearch` reports at once;
  - a page change during the pause reports the request with the typed text at once, and nothing follows;
  - unmounting during the pause reports nothing;
  - under Strict Mode a typed search reports once.
- [ ] An automatic table's search tests pass untouched.
- [ ] With `answers` passed, the table is busy from the first keystroke until the matching answer.
- [ ] The example's `AbortController` aborts the previous fetch, and the example's out-of-order answers still
      hold.
- [ ] `pnpm check table` and `pnpm check:site` pass.
