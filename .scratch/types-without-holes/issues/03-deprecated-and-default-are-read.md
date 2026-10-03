# 03: `@deprecated` and `@default` are read

Status: done
Blocked by: 01 (One table model, two writers)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** A deprecated prop carries a "Deprecated" badge followed by the tag's sentence and stands last in its table. `@default` wins over the destructuring default; if both exist and differ, the generator stops with file, line and both values. The Default column shows a default as code when it parses as a literal, identifier or property access, otherwise as a short phrase. `@remarks` and all other tags are dropped. Both writers render it the same.

- [ ] Reader fixtures: `@deprecated` and `@default` are read; a conflicting `@default` stops the generator with file and line.
- [ ] Both `@deprecated` props in the code show the badge and the sentence and stand last.
- [ ] A phrase default (e.g. "the size of a ControlSizeProvider, else `md`") renders as prose in the Default column.
- [ ] The parity test covers a deprecated row and a tag default.
- [ ] `@since` is not read or shown.

## Comments

Delivered: the props reader (`packages/demo/src/tooling/propsReader.ts`) reads two tags per member: `@default` and `@deprecated`. It takes the tag's text on one line. `@remarks`, `@since` and the other tags are still dropped. `PropEntry` gains `deprecated?` (the sentence) and `defaultIsPhrase?`. `@default` wins over the destructuring default. If the two differ after trimming, the reader throws `<file>:<line>  <prop>: `@default` says `…`, the destructuring pattern `…`.`, which stops the generator. A tag default is code when it parses (through the TypeScript parser) as a literal, a negative number, an array or object literal, an identifier or a property access. Anything else is a phrase. A destructuring default is always code. In a union, a member deprecated in one arm stays deprecated in the merged row, which is the `footer` case. The table model (`apiTable.ts`) lists deprecated rows last in each group (props and events). A row's `defaultValue` is now a span list: one code span, or the phrase with its marks. The HTML opens the description cell with a `Deprecated` badge (`.apiDeprecated .apiBadge`) and the sentence. The Markdown opens it with `*Deprecated* sentence`.

Both props in the code now carry the badge and stand last: `TableProps.filter` and the Column's `footer`. It shows in props.json, the prerendered HTML and `docs/llms-full.md`.

Tests: `propsReader.test.ts` (fixture `fixtures/props/tags.tsx`) covers a value default, a phrase default, a tag that agrees with the pattern, `@deprecated` with its sentence, `@remarks`/`@since` dropped, deprecated taken from one arm of a union, and the conflict stopping with file and line. `apiTable.test.ts` covers parity with a deprecated row and a phrase default: same order (deprecated last, events apart and not), the badge, a code default against a phrase default in both writers. lint, typecheck and test:unit are green. In Playwright, the shell, page, screenshot and accessibility suites of all ten projects ran: 1598 passed, 1 failed. The failure is `language--own-components` (ui-light) on the word "Today", the same one ticket 01 reported, and it was left as it is.

Baselines moved: none.

Deviations: none in substance. The badge stands at the start of the description cell, not beside the name. `required` keeps its place by the name.
