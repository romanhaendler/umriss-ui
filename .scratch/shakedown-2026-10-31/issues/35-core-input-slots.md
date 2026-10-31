# 35: Core - start and end slots on Input

Status:     ready-for-agent
Blocked by: 01

Spec: `../spec.md`, decision 8. Source: P9 wish (adornments).

- [ ] `Input` takes `start` and `end` (a unit such as "kg", an icon, an `IconButton`) inside its frame; the field's width rule (ADR-0041) and focus ring hold; a text slot is part of the description of the field.
- [ ] Core's password-reveal recipe uses the `end` slot.
- [ ] Unit tests; an example; `pnpm check core`, `pnpm check:site`.

## Comments
