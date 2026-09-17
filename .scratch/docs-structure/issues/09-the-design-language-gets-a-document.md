# 09 — The design language gets its own document

Status: done
Type: task

Blocked by: 02

Spec: `.scratch/docs-structure/spec.md`

## Scope

The "Ink & Paper" passage is the best-written thing in the workspace and it is filed in the appendix of one package, although it governs all three. `packages/core/README.md` does five jobs; after this it does three.

**`docs/design-language.md`** takes, unchanged in wording: the guiding idea ("precise and quiet, with palpable quality"), **Design guidelines · the "Ink & Paper" concept** (type, numbers in monospace, colour, edges and depth, focus, motion) and **Dark theme**. It gains a short head saying that this holds for `@umriss-ui/core`, `@umriss-ui/charts` and `@umriss-ui/table` alike, and a closing pointer at the design-language entries in `CONTEXT.md` (**Token**, **Vocabulary**, **Edge**, **Shadow step**, **Tone**, **Glyph**, **Motion origin**, **Interaction-state canon**) — the document describes the language, the glossary fixes the words. Neither repeats the other.

**`packages/core/README.md`** keeps, in this order: what it is · install and use · loading the styles · wording · the generated component table · principles for new components. It links the design document where the passage stood.

**Two things must not move.** The component table is generated and guarded by `demo/tooling/readmeTable.ts`, which runs in `pretypecheck` — leave the table, its markers and the guard exactly as they are. And the **Roadmap** section: it is a repository concern rather than a package one, but it is also three sentences and half of it is already delivered. Do not carry it into the new document; either delete the delivered half and keep the rest in the README, or say in one line what is open and link `.scratch/tone-contrast/spec.md`, which is where one of the two open items lives.

## Acceptance

- `docs/design-language.md` exists; the passage is byte-identical to what stood in the README apart from the new head and pointer.
- `pnpm --filter @umriss-ui/core typecheck` is green — that is what runs the README guard.
- `packages/core/README.md` names the design document and no longer contains the Ink & Paper or dark-theme passages.
- The charts and table READMEs (ticket 04) link the same document.
- The map (ticket 02) has the row under "What moved".
