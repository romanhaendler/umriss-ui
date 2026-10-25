# 03 - An aggregate of one's own takes a name

Status: ready-for-agent
Type: task
Size: S

Blocked by: `.scratch/table-columns-from-the-data/issues/02-a-matrix-with-row-and-column-totals.md`
Spec: `.scratch/table-small-wishes/spec.md`, "A named own aggregate"

## What to build

A report developer writes a median as a function and the footer says "Median 42", to the eye and to a
screen reader, instead of "Aggregate 42".

- **The prop.** `aggregateLabel?: string` beside `aggregate`, on every column type that takes an aggregate
  of its own, `VerdictColumn` included. Its documentation says that it names a function, and that a
  built-in kind keeps its own word.
- **The footer.** With a function and a name, the name stands where a built-in kind's sign stands, before
  the value, and is the word a screen reader reads. Without a name the footer reads as today. A group
  header shows no word, as for the built-in kinds.
- **A built-in kind with a name.** The name is ignored, and development warns once per column through
  `warnOnce`, naming the column and saying that the kind's word is the wording's.
- **The example** "Name your own aggregate" on the Aggregate page, after "Write an aggregate of your own":
  a line's cycle times with a median, and its scrap rate with the sample standard deviation (n − 1), each
  function in about four lines and each named. Its lead says that median and standard deviation are not
  built in, and why: a function is shorter than two wordings, a sign and their tests.
- **Docs.** The Aggregate page's text names `aggregateLabel`. `API.md` is regenerated.

## Acceptance criteria

- [ ] Mounted tests in `aggregate.test.tsx`:
  - the footer of a named function shows the name before the value, and its accessible text is the name and
    the value;
  - an unnamed function reads as today;
  - a group header shows the value without the name;
  - a name beside `"sum"` changes nothing and warns once in development, and not in production.
- [ ] The example's median and standard deviation are checked against values worked out by hand.
- [ ] `types.test-d.tsx`: `aggregateLabel` is accepted on a field column, a computed column and a
      `VerdictColumn`.
- [ ] The demo smoke test renders the new example; its screenshot is recorded and looked at.
- [ ] `pnpm check table` and `pnpm check:site` pass.
- [ ] The changelog notes `aggregateLabel` under Added.
