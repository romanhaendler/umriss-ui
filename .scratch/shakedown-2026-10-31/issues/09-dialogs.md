# 09: Dialogs - a nested one closes alone, focus returns, confirm fires once

Status:     ready-for-agent
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 5 (Modal focus). Sources: README 1, 7, 12, 33, 34 (scroll lock), 35 (palette
mounted); earlier-runs-open core B6, core C (ModalHeader), qa 6, qa 7, settle 13a. Host repros: H4 `t6.mjs`,
`t10.mjs`, `t11.mjs`, `t17.mjs`, `t19.mjs`; P2 `nested-confirm`, `r-double` (`../reds/`).

- [ ] A ConfirmDialog, Modal or CommandPalette rendered as a React child of a Modal or Drawer closes only itself on Escape, Cancel, backdrop, Confirm and a palette choice: `onDialogClose`/`onDialogCancel` (`core/src/lib/dialogChoreography.ts:76,84`) ignore events whose target is not their own dialog.
- [ ] An open Modal hidden by `<Activity mode="hidden">` or a re-suspending Suspense closes its `<dialog>` in the effect cleanup and reopens when shown again; the page is never left inert and blank.
- [ ] Focus returns to the opener in every case: `{open && <Modal open>}` unmounting, a mouse-opened Modal in WebKit, a Toast action that opened it. The choreography remembers the opener on open.
- [ ] A Modal without `autoFocus` focuses its first field, else the dialog itself - not Close (decision 5).
- [ ] ConfirmDialog: `onConfirm` fires once per opening (buttons inert while closing); `loading` also locks Escape and the backdrop; focus stays inside the dialog when Confirm turns busy.
- [ ] Modal locks the page's scroll while open (and the comments at `Modal.tsx:26,51,77` say what is true).
- [ ] A synthetic Escape keydown (Cypress `{esc}`) closes the Modal like the native cancel.
- [ ] `ModalHeader` with children renders them (today an empty `h2`).
- [ ] A closed CommandPalette mounts nothing (no second "Search" in the DOM), like Modal since 0.50.0.
- [ ] Unit tests for each; one browser case for nesting and Activity. `pnpm check core`.

## Comments
