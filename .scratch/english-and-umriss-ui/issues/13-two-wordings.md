# 13 — Two wordings, English by default

Status: done
Type: task

Blocked by: 09, 10, 12

Spec: `.scratch/english-and-umriss-ui/spec.md` (The library ships two wordings)

## Scope

The only ticket in this effort that changes what a user sees. Ticket 04 already made the `Wording` interface's field names English; this one writes the text.

- **English becomes the default wording.** 562 lines of entries, in the register the interface describes — named after what they label, not after what they say.
- **German moves to the subpath export `@umriss-ui/core/wording/de`**, added to the manifest's `exports` map beside `./styles.css`. A named export from the main entry was the alternative; the subpath was chosen because it says without explanation that this is freight you take on purpose.
- **Both are typed `Wording`**, so a missing entry is a compile error. That is the whole conformance mechanism — do not write a test that re-checks what the type system already refuses.
- **One German mount test per package.** The seam exists: `wortlautQuelle`/`wordingSource`, and the table's toolbar wording test. Each mounts under the German wording and asserts one string, so the subpath stays wired and is not quietly broken by a later entry.
- **Two ADRs.**
  - **0018 — Everything is English.** States the reversal of ADR-0015 and its three reasons: the scope is `umriss-ui`, the audience is not German-speaking, and nothing was ever published, so the change is free exactly once. ADR-0015 gets `Status: Superseded by ADR-0018` at its top and is otherwise untouched — its reasoning is what stops a future reader reopening the question a third time. The German identifiers quoted *inside* 0015 as examples (`zustaende`, `spurVon`, `faerbung`) stay: they are quotation, not reference.
  - **0019 — Two wordings ship, English is the default.** Records that the glossary's old claim ("German is the only shipped language, because there is no second one") has been inverted, that the completeness guarantee is the type and the drift risk is accepted, and that a third language is an application's business.
- Update the **Wording** entry in `CONTEXT.md` accordingly.

## Acceptance

- `pnpm typecheck`, `pnpm lint`, `pnpm test:unit` pass across the workspace.
- Default-mounted components render English; `@umriss-ui/core/wording/de` renders German.
- Removing one entry from either wording object fails the typecheck.
- `pnpm build` emits the subpath, and it resolves from a consumer's import.
- ADR-0015 says `Superseded by ADR-0018`; 0018 and 0019 exist.
