# 06 — `#own-styles` is copied into the bundle once per module

Status: needs-triage
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
