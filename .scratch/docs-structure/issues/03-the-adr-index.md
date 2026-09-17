# 03 — The ADR index and the status lines

Status: done
Type: task

Spec: `.scratch/docs-structure/spec.md`

## Scope

Nineteen ADRs, no index, and no way to tell from the outside of a file whether its decision still holds.

**A status line in every ADR**, directly under the title, two lines and no frontmatter:

```
Status: accepted
Date:   2026-08
```

`Status:` is `accepted`, or `superseded by ADR-NNNN` where that applies. Exactly one is superseded today: **ADR-0015** ("Props are English, identifiers are German") by **ADR-0018**, which says so in its own body and is repeated in `CONTEXT.md`. Nothing else is reversed; check each file's body before writing `accepted`, do not assume it.

`Date:` is the month of the file's first commit (`git log --diff-filter=A --format=%ad --date=format:%Y-%m -1 -- <file>`), not the date of writing.

The skill's own format (`.agents/skills/domain-modeling/ADR-FORMAT.md`) names Status as an optional section "useful when decisions are revisited". They have been revisited once; that is the case it describes.

**`docs/adr/README.md`**, the index. One table, sorted by number — the numbering is the chronology and stays the truth — with the columns *ADR · Title · Status · Area*. Areas, from reading the files: charts (0001, 0002, 0007, 0008, 0011), tree (0003, 0004, 0005), limits and alarms (0006, 0009, 0010), surface and motion (0012, 0013, 0014), architecture (0016, 0017), language (0015, 0018, 0019). Above the table, three sentences: what an ADR is here, that the number is never reused, and that a superseded ADR is kept rather than deleted because the code it explains is still readable in the history.

No ADR body is rewritten. This ticket adds two lines to each and one new file.

## Acceptance

- Every file in `docs/adr/` carries a `Status:` and a `Date:` line, and no other change.
- `ADR-0015` reads `superseded by ADR-0018`; every other file reads `accepted`, each checked against its body.
- `docs/adr/README.md` lists all nineteen, and the count in its opening sentence matches the number of files.
- The next ADR to be written is 0020 — see `.scratch/demo-consolidation/issues/01`.

## Comments

**Delivered.** Every ADR carries `Status:` and `Date:`; the dates come from each
file's first commit (0001–0011 are 2026-08, 0012–0019 are 2026-09). Each body was
read before `accepted` was written. Two files already carried a status line and
keep their meaning: 0015 is `superseded by ADR-0018`, and 0018 reads
`accepted — supersedes ADR-0015` rather than a bare `accepted`, because dropping
that half would have lost what its own head said. ADR-0003's blockquote about its
partly superseded Consequences section stands unchanged beneath the new lines.
ADR-0020 was written by `.scratch/demo-consolidation/issues/01` in the same
session and is in the index.
