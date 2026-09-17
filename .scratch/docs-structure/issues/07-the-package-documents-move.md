# 07 — The package documents move into docs/

Status: done
Type: task

Blocked by: 02

Spec: `.scratch/docs-structure/spec.md`

## Scope

Rule C of the spec: a capitalised filename means the ecosystem knows the file under that name. These four do not qualify, and one of them is an archive standing in the front room.

| From | To | Why |
|---|---|---|
| `packages/core/GLYPHS.md` | `packages/core/docs/glyphs.md` | not a name npm or a code host knows |
| `packages/core/TREE.md` | `packages/core/docs/capabilities-tree.md` | a capability record; its own second line says it follows charts' STATUS |
| `packages/charts/STATUS.md` | `packages/charts/docs/capabilities.md` | same genre, so the same word |
| `packages/core/HANDOFF.md` | `docs/archive/handoff-2026-08.md` | self-declared "a historical record, not a description of the workspace as it is" |

After this, a package root holds `README.md`, `CHANGELOG.md`, `LICENSE`, `package.json` and configuration. Nothing else.

**The pointers that must move with them.** Six code comments cite `HANDOFF.md` by path, and the handoff's own preamble names them: `eslint.config.js`, `TimeField.tsx`, `Popover.tsx`, `popover.test.tsx`, `RangePanel.tsx`, the table's `columnFilter.tsx`, plus `TREE.md` itself. `packages/core/README.md` links `GLYPHS.md`; the root changelog names `GLYPHS.md` and `STATUS.md`; `TESTS.md`/`docs/testing.md` names `STATUS.md`. Run the grep, fix every hit outside `.scratch/`, and do not touch `.scratch/`.

**`docs/archive/README.md`** — three sentences: what lies here, that it is kept because live code cites it, and that nothing in it describes the workspace as it is.

The handoff's own preamble already explains itself well; it needs one added line saying where it now lives and that the move changed nothing about it.

## Acceptance

- The four files are at their new paths; `git log --follow` still finds their history.
- `pnpm lint` and `pnpm typecheck` are green — `eslint.config.js` is one of the files that cites the handoff.
- No pointer outside `.scratch/` names an old path (`grep -rn "HANDOFF\.md\|GLYPHS\.md\|STATUS\.md\|TREE\.md" --exclude-dir=.scratch`).
- The map (ticket 02) has all four rows under "What moved".
