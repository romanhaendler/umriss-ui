# The surface of the three young packages

Type:   research
Status: claimed

## Question

Review the public surface of `@umriss-ui/calculation`, `@umriss-ui/dashboard` and `@umriss-ui/alarms` for what should not be frozen as it stands.

Read `packages/<pkg>/API.md` first (every export, prop, option and return), then the source and the demo examples where a
line raises a question. Look for:

- **Inconsistent names**: the same thing named two ways across components or packages (a prop, a callback,
  a value of a union), and names that disagree with `CONTEXT.md`.
- **Inconsistent shapes**: callbacks that report differently for the same kind of event, controlled and
  uncontrolled pairs that do not follow one pattern, options that are a boolean here and a union there.
- **Loosely typed surface**: `unknown`, `any` or `string` where the caller could be checked.
- **Deprecated aliases and renames still alive**, and anything exported that nothing documents or uses.
- **Defaults** that surprise, and props whose doc sentence and behaviour disagree.

Candidates only, no decision. For each: where (`file:line`), what stands there, whether setting it right
after 1.0 would cost a major, the smallest change, its size (S/M/L). Say what was not read.

Findings: `.scratch/release-1-0/research/08-the-surface-of-the-three-young-packages.md`

For each of the three also: is it fit to freeze at all - how much of it changed in the last ten minors (its
`CHANGELOG.md`), and what in it still reads as provisional?
