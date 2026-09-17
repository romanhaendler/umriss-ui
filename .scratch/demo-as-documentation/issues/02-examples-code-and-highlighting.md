# 02 — Examples: files, source, highlighting

Status: done

Spec: `.scratch/demo-as-documentation/spec.md`

## Scope

The mechanism by which an example is both a running component and a block of
source, independent of any page that uses it.

**The file convention.** `demo/beispiele/<Baustein>/NN-<slug>.tsx`, default
export renders it, `export const titel` names it. The `NN` orders the run, the
`<slug>` is the anchor. Fixtures live inside the file that needs them.

**The list.** `import.meta.glob` over the directory, eager for the components
and eager-raw for the sources, keyed by path. There is no written list of
examples anywhere and no place to register a new one. A file that does not
export `titel` fails loudly at load rather than rendering as "undefined".

**What is displayed.** The raw file, minus the `titel` export line, with the
import specifier `"../../../src"` rewritten to `"@umriss/ui"`. Both are pure
string functions in their own module, unit-tested, with no other transformation
of the source — no reformatting, no reindenting, no stripping of comments.

**The highlighting.** `sugar-high` as a devDependency of `@umriss/ui`. Map its
token classes onto existing tokens in both themes; do not import or adapt a
third-party theme. Six meaningful colours, per the spec.

**The two controls.** A per-example collapse control, and a page-level "alle
Beispiele mit Code" switch whose state the page holds. A copy button on each
block that copies exactly what is displayed.

Deliver a `Beispiel` component and a `Vorführung` component. They differ only in
presentation — a demonstration is wider, sits last, and is labelled as one — and
they must not be two implementations of the same thing.

## Acceptance

- Adding a file to `demo/beispiele/Button/` makes it appear, in `NN` order, with
  no other edit anywhere.
- The displayed source contains no `titel` line and no `../../../src`, and
  copying it yields text that compiles in a consumer project.
- Unit tests for both string functions, including: a file whose body contains
  the literal string `"../../../src"` inside example code is not corrupted; a
  file with no `titel` export throws; a `titel` spanning two lines is removed
  whole.
- The collapse control and the page switch agree: opening all and then
  collapsing one leaves the rest open.
- Highlighting uses only token-derived colours; no hard-coded hex in the code
  block styles.
- Copy works over HTTPS and localhost, and its failure path does not throw into
  the page.

## Notes

The rewrite is the only sanctioned divergence between file and display. If a
second one becomes tempting later, that is the moment to reconsider `?raw`
entirely rather than to add a second rule.

Eager glob imports mean every example ships in the demo bundle. That is
acceptable for a demo and is the price of the file-is-the-list property. If the
bundle later becomes a problem, the fix is lazy component imports with eager raw
sources, not a hand-written list.

`sugar-high` classes are few enough to enumerate in the stylesheet by hand;
do not generate that mapping.

## Comments

**Delivered.** Four modules:

* `demo/werkzeug/dateiname.ts` — the naming convention, once. It stands there
  and not twice, because the demo reads the files via `import.meta.glob` and the
  screenshot suite via the file system: two ways, one opinion.
* `demo/werkzeug/quelle.ts` — the two pure string functions.
* `demo/werkzeug/beispiele.ts` — the glob, eager for component and source text.
* `demo/Beispiel.tsx` — `Beispiel`, and the demonstration as *the same*
  component with `data-vorfuehrung`. No second implementation.

Deviation: the folder is called `Button`, `Stack-und-Grid` — that is, the name
of the page in the component's spelling, and lowercased it is the address. A
rule, not a little mapping table. A folder without a page is noticed at load.

The switch: it sets the **default**, collapsing a single one sets an exception
to it, and a new state of the switch clears the exceptions away. This is caught
up during rendering and not in an effect — an effect would only run after
painting, and the reader would see the old state for a screen's length. The
ESLint rule `react-hooks/set-state-in-effect` says the same.

`sugar-high` 2.4.0 as a devDependency. It sets the colour of each mark as
`var(--sh-…)`; the ten names stand by hand in `demo/beispiel.css`, mapped onto
tokens, no hex. **`--u-color-text-muted` explicitly does not stand there**: the
token is recorded as an exception to 4.5:1 because it carries labels and never
running text — in a code block everything is running text, the comments first.

Tests: `tests-unit/quelle.test.ts`, ten of them, including the three cases named
in the ticket (a path in the body stays untouched, a missing `titel` throws, a
two-line `titel` is dropped whole).
