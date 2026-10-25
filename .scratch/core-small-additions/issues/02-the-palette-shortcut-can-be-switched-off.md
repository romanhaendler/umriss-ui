# 02 - The palette's shortcut can be switched off, and keeps out of selects, textboxes and dialogs

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/core-small-additions/spec.md`

## What to build

An application can offer its users a setting that turns the single-key "/" off (WCAG 2.1.4), and the
shortcut no longer fires where it does harm (`accessibility.md` 5).

- **The option.** `useCommandPaletteShortcut(onOpen, { slash })`, `slash` defaulting to `true`, its type
  exported as `CommandPaletteShortcutOptions`. The options may be new on every render; the hook reads the
  latest, as it does for `onOpen`, and does not resubscribe.
- **`slash: false`** makes "/" no shortcut at all. Cmd+K / Ctrl+K still opens.
- **The guard for "/"**: it is a character, and does not open, where the key's target or an element around
  it is an `input`, a `textarea`, a `select`, editable content, or has the role `textbox`, `searchbox` or
  `combobox`.
- **Inside a modal dialog**, neither key opens: a `<dialog>` shown as modal, or an element with
  `aria-modal="true"`, around the key's target.
- **Remapping** is the application's own listener calling the same `onOpen`. The hook's doc comment says so
  in one sentence.
- **The shortcut example** on the CommandPalette page gains an application setting, shown as a `Switch`,
  that passes `slash`. Its lead names WCAG 2.1.4.
- Core's README row of the palette names the switch. Regenerate `API.md`.

## Acceptance criteria

- [ ] jsdom tests beside the palette's shortcut tests:
  - [ ] "/" on the body opens, and with `slash: false` does not, while Ctrl+K and Cmd+K still do;
  - [ ] "/" on a focused `select`, and on elements with `role="textbox"`, `"searchbox"` and `"combobox"`
        (and on a child of one), does not open;
  - [ ] neither key opens inside an element with `aria-modal="true"`, nor inside a `<dialog>` opened as
        modal;
  - [ ] changing `slash` between renders takes effect without remounting.
- [ ] The existing shortcut tests pass unchanged.
- [ ] `pnpm check core` and `pnpm check:site` pass, and `API.md` is current.
- [ ] Core's changelog lists the option under "Added" and the guard under "Fixed".
