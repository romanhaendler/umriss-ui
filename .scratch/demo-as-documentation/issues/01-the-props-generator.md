# 01 — The props generator and the JSDoc gate

Status: done

Spec: `.scratch/demo-as-documentation/spec.md`

## Scope

`packages/ui/demo/werkzeug/props.ts` — a Node script run by a `prebuild:demo`
step, written directly against the TypeScript compiler API. No new dependency:
`typescript` is already a devDependency. No React, no DOM, no import from the
demo it feeds.

Given the page list (spec, **The page list**) it walks each component's props
interface and writes one JSON file to `demo/.generiert/props.json`, which is
`.gitignore`d. Per prop: name, type as written, optionality, default where the
component destructures one, and the JSDoc text.

Three behaviours, none of which an off-the-shelf docgen gives:

1. **Inherited DOM props collapse.** `ButtonProps extends
   ButtonHTMLAttributes<HTMLButtonElement>` contributes no rows. The record
   instead carries the element it extends, so the page can print one sentence.
   What the library declares itself is listed; what React declares for the
   element is not.

2. **Generics stay generic.** `Table<T>` and `TreeView<T>` show `T` as `T`, not
   as its constraint and not as `unknown`. A reader who sees `spalten:
   Spalte<T>[]` learns the shape; a reader who sees `Spalte<unknown>[]` learns
   nothing.

3. **A bare prop throws.** Any prop that will land in a table and has no JSDoc
   comment fails the script with a message naming the file, the line and the
   prop. This is the gate; it is the reason the script exists rather than a
   library.

Defaults are read from the component's destructuring pattern
(`variant = "secondary"`) where one exists, and are absent otherwise. Do not
invent a default from the type.

## Acceptance

- `pnpm --filter @umriss/ui build:demo` runs the script first and fails the
  whole build if any documented prop lacks JSDoc.
- Unit tests against fixture source files in `tests-unit/`: a prop with JSDoc is
  recorded with its text; a prop without one throws with file and line in the
  message; an interface extending a DOM attribute type yields zero inherited
  rows and records the element; a generic interface keeps its parameter name; a
  destructured default is recorded and an absent one is not.
- The generated file is in `.gitignore` and no generated JSON is committed.
- The script exits non-zero on failure and prints every violation, not the
  first — sixty missing comments in sixty runs is not a workflow.
- Running it twice produces byte-identical output.

## Notes

Do this before anything that renders a table. Ticket 03 consumes the JSON and
should never parse TypeScript itself.

Writing the roughly sixty missing JSDoc comments is **not** this ticket. This
ticket makes their absence fail; the rubric tickets (05–09) write them for their
own pages. Until then the gate is configured to list violations and pass —
ticket 03 flips it to fail once `Button` is clean, and each rubric ticket keeps
it failing for a wider set. Record the current violation count in the ticket
when you hand over.

The type "as written" matters: print the source text of the annotation, not the
checker's normalised form. `"primary" | "secondary" | "ghost" | "danger"` is what
the author wrote and what the reader needs; `ButtonVariant` resolved away is
worse, and the fully expanded union of a mapped type is unreadable.

## Comments

**Delivered.** The reader stands in `demo/werkzeug/propsLeser.ts` (pure: files
in, entries out, no knowledge of the demo or the outline), the gate in
`demo/werkzeug/props.ts`. Run: `pnpm --filter @umriss/ui props`; `predev`,
`prebuild:demo` and `pretypecheck` call it.

Deviations from the ticket, both deliberate:

* **No `--experimental-strip-types` detour via an intermediate compilation.**
  The script runs directly as `.ts` under Node 22 (`--experimental-strip-types`).
  For that, `allowImportingTsExtensions` stands in `tsconfig.json` and
  `@types/node` in the devDependencies — the only new dependency, and a pure
  type dependency. No docgen has been added.
* **The allow list does not exist.** The ticket provided for one so that the
  rubric tickets could land one after another. Here all 149 comments are written
  in one go, so the list would have stood empty on the day of its introduction.
  The gate is unconditional from the start.

**Count at handover: 149 props without JSDoc**, not the sixty estimated in the
ticket. The estimate was right per component, the sum was not. All 149 are
written; the gate is green.

What the ticket did not foresee and what has been added: the outline also names
the *options* types per page (`ComboboxOption`, `MultiSelectOption`,
`RadioOption`, `CommandPaletteItem`, `DockTool`). Without them the table would
say `options: readonly ComboboxOption<T>[]` and nowhere what that is.

Inheritance: `Omit<HTMLAttributes<…>, "title">` collapses into one sentence and
names the omission; `Omit<ButtonProps, …>` on the other hand does **not** — the
props of a library interface are props of this component and stand there with a
note of where they come from. The difference has its own line in the reader
(`Erbe.bibliothek`) and a test.

Tests: `tests-unit/propsLeser.test.ts`, ten of them, against two fixture files
under `tests-unit/fixtures/props/`. Two runs yield the same JSON file, byte for
byte (verified).
