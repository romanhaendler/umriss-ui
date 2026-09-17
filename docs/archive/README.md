# Archive

Documents that were true when they were written and are kept because live code
or a live document still points into them.

Nothing here describes the workspace as it is. A file lands in this directory
precisely when it stops doing that and cannot simply be deleted — because a code
comment cites a section of it, or because the specs under `.scratch/` speak the
language it records.

| Document | What it is | Why it is kept |
|---|---|---|
| [`handoff-2026-08.md`](handoff-2026-08.md) | The handoff of the standalone `umriss-ui_12` state, August 2026 | Six code comments cite its part A.5; it is the only written source for several conventions the components still obey |
| [`rename-2026-09.md`](rename-2026-09.md) | Old name → new name, from `english-and-umriss-ui` | The specs under `.scratch/` speak in the old names |

What does describe the workspace as it is: [`../../README.md`](../../README.md),
[`../README.md`](../README.md) as the map, `CONTEXT.md` for the vocabulary and
`docs/adr/` for the decisions.
