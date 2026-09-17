# 01 — The front door

Status: done
Type: task

Spec: `.scratch/docs-structure/spec.md`

## Scope

A `README.md` and a `LICENSE` at the repository root. Both are new files; nothing is moved and no link breaks.

**`README.md`**, in this order:

1. What umriss is, in two sentences: a pnpm workspace of React packages for data-dense applications, precise and quiet.
2. The packages, as a table — name, version, one sentence, and whether it is published. `@umriss-ui/core` (0.10.0), `@umriss-ui/charts` (0.2.0, depends on nothing), `@umriss-ui/table` (0.1.0, peer on core), `@umriss-ui/demo` (private, the shell both demos are built from).
3. Quick start: install `@umriss-ui/core`, import `@umriss-ui/core/styles.css`, bring the four Geist font faces. Take the lines from `packages/core/README.md` — they are correct and tested by the demo's own `main.tsx`.
4. The demos: `pnpm dev:core`, `pnpm dev:charts`, `pnpm dev:table`, with the sentence that the demo **is** the documentation for the components.
5. Where the documentation is: a link to `docs/README.md` (ticket 02) and one line each for `CONTEXT.md`, `docs/adr/`, `CONTRIBUTING.md`.
6. Maturity, stated honestly: every package is `0.x`, no number promises compatibility, and whatever the registry actually says about publication. **Check `npm view @umriss-ui/core version` before writing this line** — `english-and-umriss-ui` recorded 404 for all three on 12 Sep 2026, and that is the kind of fact that changes without anybody editing a document.
7. Licence: MIT, one line, pointing at `LICENSE`.

**`LICENSE`**: MIT, the same text and copyright holder as `packages/core/LICENSE`. The three package licences stay where they are — npm packs them.

Not in this file: the design language (ticket 09 gives it a document), the component roster (it is generated into `packages/core/README.md`), any roadmap.

## Acceptance

- `README.md` and `LICENSE` exist at the root; no other file is edited.
- Every command named in the README runs from a clean clone after `pnpm install`.
- Every path named in the README exists, including `docs/README.md` if ticket 02 has landed — otherwise that link is added by ticket 02 rather than pointing at nothing.
- The publication line matches what the registry says on the day it is written.

## Comments

**Delivered.** `README.md` and `LICENSE` written; no other file touched by this
ticket. The publication line was checked rather than assumed: `npm view` returns
404 for `@umriss-ui/core`, `@umriss-ui/charts` and `@umriss-ui/table` on 13 Sep
2026, so the README says none of them is published.
