# The surface of core

Type:   research
Status: resolved

## Question

Review the public surface of `@umriss-ui/core` for what should not be frozen as it stands.

Read `packages/core/API.md` first (every export, prop, option and return), then the source and the demo examples where a
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

Findings: `.scratch/release-1-0/research/04-the-surface-of-core.md`

## Answer

Findings: `.scratch/release-1-0/research/04-the-surface-of-core.md`. `API.md` was read whole; the source was
sampled (the entry file, the provider, about fifteen prop interfaces, the wording headers, the token names).
Not read: the components' behaviour, the 443 wording members, the demo examples, the other packages (use
counts are from a word grep).

No deprecated alias is alive in core, and the field contract of ADR-0081 holds in the twenty stateful
components checked.

Candidates whose change breaks a caller (decided in "What of core's surface changes before 1.0"):

- **Density has two words**: `"comfortable" | "compact"` in core, `"regular" | "compact"` in `useDensityFor`
  and in the table's and the calculation's props.
- **`Wording` is one interface of 443 keys**, most of them the other packages', and it is accepted as a whole
  object: a new key anywhere fails the compile of a caller who passes a complete one.
- **About fifteen exports nothing outside core's tests or the sibling packages uses** (`resetAnnouncer`,
  `hasWarned`, `mergeLanguage`, `scrollForRow`, `DEFAULT_SEPARATORS`, some glyphs, `FormFieldBoundary`, ...).
- **`clearable` without `onClear`** on Input, Select and TreeSearch shows a cross that does nothing; every
  other clearable field clears through `onValueChange`.
- **`showLabel`** on Meter and ProgressBar shows the percentage, with different defaults; Slider calls it
  `showValue`.
- **Open and close**: `onClose` on Modal and CommandPalette, `onOpenChange` on Popover and ContextMenu, no
  controlled form on Menu. **Tones**: `default` beside `neutral`, `primary` beside `danger`, no `accent` on
  Toast. **Type names**: `Key` beside React's, `Side` with two meanings.
- **`useTree` returns `revealCount`**, a counter of its own state.

Not a break: `API.md` prints "default: 12" for every glyph where the code says 9, 10, 12 and 16; three
exports have no props documentation; `--u-control-height-xs` is read by nothing; none of the 158 tokens is
marked public or internal; `warnDeprecated*` in `lib/dev.ts` is dead and unexported.
