# 06 — `#own-styles` is copied into the bundle once per module

Status: done
Type: finding

Found in the developer's round of control-sizes (1 Oct 2026), not caused by
it. Every component module that composes from `#own-styles` (`text`, `field`,
`ring`, `extent`, ...) brings its own compiled copy of the whole file into
`dist/core.css`: a rule of `own.module.css` stands there once per composing
module - `caret-color: var(--u-color-accent)` 74 times, the field's width rule
37 times.

Measured on `dist/core.css`:

| | raw | gzip |
|---|---|---|
| origin/main before control-sizes | 196 324 B | 22 487 B |
| with control-sizes | 208 000 B | 23 086 B |

About half of the raw stylesheet is these copies. Over the wire gzip folds
them (the whole file is 23 kB), so the cost is parse time and the size a
developer sees in their bundle analyser, not transfer.

ADR-0021 decided that each package's bundle carries its own compiled copy of
the shared file - one copy per package, which the build does not hold to. A
fix lies in the build (one module that the others compose from by a stable
class name, or a post-step that folds identical rules), not in the components,
and it would move no picture.

## Comments

Done 2026-10-10. `ownStyles()` (`scripts/styles/ownStyles.ts`) folds the copies
in `generateBundle`, so every build passes through it - the three library
builds and the demo builds; a dev server serves each module's CSS on its own
and cannot be folded. Exact duplicates only: a rule whose selector holds a
class of `own.module.css`, same text, same layer and `@media`; the repeated
layer-order statements and the blocks the folding empties go with them.

Measured with `pnpm build` (raw / gzip -9, B):

| | before | after |
|---|---|---|
| core | 228 089 / 24 363 | 157 584 / 22 744 |
| table | 49 285 / 8 101 | 47 337 / 7 638 |
| charts | 15 269 / 3 294 | 15 269 / 3 294 |
| schedule | 10 008 / 2 336 | 9 957 / 2 330 |
| calculation | 15 084 / 3 085 | 15 033 / 3 080 |

`caret-color: var(--u-color-accent)` in core: 78 times, now 2 (the `.field`
rule and the autofill rule, which are two rules). `check:dist` passes for all
five packages.

Why it moves no picture. The copies are byte-identical with identical hashed
class names (the hash is of `own.module.css`, not of the composing module), and
a class goes on every element that composes it, whichever module's copy it is.
Across layers order does not count (`umriss.base` loses to `umriss.components`
wherever it stands). Inside `umriss.components` position decides between rules
of equal specificity, and there an own rule stands where its **last** copy
stands - so the last copy is the one kept, not the first.

The first was the plan and would have moved something: NumberInput's
`.sm .input { font-size }` and the field's touch size `.field.field`
(`pointer: coarse`) are both (0,2,0); today the field's copy of a later module
stands after NumberInput's rule and wins (16px, no iOS zoom), a folded first
copy would lose to it (11.5px). The last copy keeps the order of every pair of
rules as it was; checked by comparing the rule sequence of each package's
stylesheet before and after against "before, own rules reduced to their last
copy" - identical for all five. The visual suite is the proof that no picture moved.
