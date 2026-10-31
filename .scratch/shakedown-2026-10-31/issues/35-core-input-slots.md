# 35: Core - start and end slots on Input

Status:     done
Blocked by: 01

Spec: `../spec.md`, decision 8. Source: P9 wish (adornments).

- [x] `Input` takes `start` and `end` (a unit such as "kg", an icon, an `IconButton`) inside its frame; the field's width rule (ADR-0041) and focus ring hold; a text slot is part of the description of the field.
- [x] Core's password-reveal recipe uses the `end` slot.
- [x] Unit tests; an example; `pnpm check core`, `pnpm check:site`.

## Comments

**Delivered (2026-10-31, run coordinator).** Input takes `start` and `end` inside its frame (end after the
clear cross); a text slot joins `aria-describedby` and widens the field as NumberInput's units do; the
reveal-a-secret recipe puts its eye in `end`; new example "Units in the frame". Looked at, light and
dark: right. Decided: `textChars` moved to `lib/extent.ts` (shared with NumberInput); the table's Search
omits `start`/`end` (no slots offered there yet).
