# 18: The table reports selection changes

**What to build:** An application learns which rows are ticked without holding the selection itself: `useTable` takes `onSelectionChange`, called with the selected keys after each change the user or the API makes - from an effect, never during render, so lifting it into state cannot loop. The controlled `selection` prop stays as it is. Spec: `../spec.md` ("Table: onSelectionChange"); repro: `../personas/p16-migration.md` 5 and the wish "onSelectionChange".

**Blocked by:** 07 (the same hook)

**Status:** ready-for-agent

- [ ] A component test: ticking a row, "select all", shift-click range and clearing each call `onSelectionChange` once with the right keys
- [ ] A component test: a parent that stores the keys in state on every call renders without a loop or a React warning
- [ ] Works with internal and with controlled selection, and in server mode
- [ ] README, `llms-full.md` and API.md name it
- [ ] Commit body: `Changelog table Added:` line
