# 03: `@deprecated` and `@default` are read

Status: ready-for-agent
Blocked by: 01 (One table model, two writers)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** A deprecated prop carries a "Deprecated" badge followed by the tag's sentence and stands last in its table. `@default` wins over the destructuring default; if both exist and differ, the generator stops with file, line and both values. The Default column shows a default as code when it parses as a literal, identifier or property access, otherwise as a short phrase. `@remarks` and all other tags are dropped. Both writers render it the same.

- [ ] Reader fixtures: `@deprecated` and `@default` are read; a conflicting `@default` stops the generator with file and line.
- [ ] Both `@deprecated` props in the code show the badge and the sentence and stand last.
- [ ] A phrase default (e.g. "the size of a ControlSizeProvider, else `md`") renders as prose in the Default column.
- [ ] The parity test covers a deprecated row and a tag default.
- [ ] `@since` is not read or shown.
