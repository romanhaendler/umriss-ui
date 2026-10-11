# 06 - Sums from the server

Status: ready-for-agent
Type: task
Size: M

Blocked by: 01
Spec: `.scratch/table-server-mode-2/spec.md`, "Sums from the server (T4)"

## What to build

`totals?: Readonly<Record<string, unknown>>` in server mode: by column id, the
value of the column's declared `aggregate` over every match. The footer, today
off in server mode, shows when `totals` is passed and a column declares an
`aggregate`; its cells take the value instead of computing it, formatted with
the column's format and the signs and words of the automatic footer
(`aggregateValue.tsx`); a `range` is `[min, max]`; every kind and an
aggregate of one's own are taken as given. A missing key shows the absent value.
While busy (`loading`, or `answers` not the current request) the cells are
skeleton. Each carries a hidden "all matches" (new key `footerOfMatches`).

## Acceptance

- [ ] Each kind (`sum`, `avg`, `min`, `max`, `range`, `count`, `distinct`, own)
      renders from `totals` as the automatic footer renders its computed value.
- [ ] No `totals`: no footer, as today; the footer's DEV note, if any, is updated.
- [ ] A missing key is an absent cell; a busy table shows skeleton, never old sums.
- [ ] Rows on the page do not enter the sum (a test where page and totals differ).
- [ ] `footerOfMatches` in both wordings; a photograph of the footer in value and in skeleton.
