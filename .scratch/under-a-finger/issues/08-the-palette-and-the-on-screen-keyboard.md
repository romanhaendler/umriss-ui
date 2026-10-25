# 08 - The palette's close, and what the on-screen keyboard is told

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/under-a-finger/spec.md`

## What to build

A touch-only user can close the command palette, and the on-screen keyboard says what Enter does in the
fields whose Enter the library owns.

- **The palette's close.**
  - A close cross in the palette's input row, named by the wording's close text, reporting through
    `onClose`.
  - It is rendered always and hidden under a fine pointer by CSS, so the markup is one for every device.
  - Under a finger it meets the 24 px floor.
- **Keyboard hints:**
  - the CommandPalette's input: `enterkeyhint="go"`;
  - Combobox and the MultiSelect's search: `enterkeyhint="done"`;
  - TreeSearch and the table's Search: `enterkeyhint="search"`;
  - Combobox, the MultiSelect's search, TreeSearch and the table's Search: `autocomplete="off"`, as the
    palette's input already has.
- **A caller's own value wins** wherever the field passes attributes through. Plain Input, NumberInput,
  Textarea and Select get no defaults.

## Acceptance criteria

- [ ] Unit tests:
      - the palette's cross calls `onClose`;
      - each listed field renders its `enterkeyhint` and `autocomplete`;
      - a caller's `enterKeyHint` or `autoComplete` replaces the default where the field passes it
        through.
- [ ] A feature test asserts that the cross is visible under `hasTouch` and not under a fine pointer.
- [ ] `pnpm check core`, `pnpm check table` and `pnpm check:site` pass.
