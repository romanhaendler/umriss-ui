# 05 - The overlays, the navigation and the tree take `ref` as a prop

Status: done
Type: task
Size: M

Blocked by: 03
Spec: `.scratch/react-19-and-performance/spec.md`, "The floor"; user stories 3, 4, 6

## What to build

The pattern of ticket 03, applied to twenty-one wrappers: `Accordion` and
`AccordionItem`, `Breadcrumb`, `CommandPalette`, `MenuItem`, `MenuSeparator`,
`Modal`, `Drawer`, the dialog frame the two share, `ModalHeader`, `ModalBody`,
`ModalFooter`, `ConfirmDialog`, `Splitter`, `Stepper`, `Tabs`, `TabList`,
`Tab`, `TabPanel`, `TreeSearch`, `TreeView`.

`Modal` and `ConfirmDialog` have the `<dialog>` as their root; this ticket
adds the type test for a dialog root. `Menu` clones the caller's trigger: if
no test holds that the caller's ref on that trigger keeps its element, the
tooltip's test is written for the menu.

Nothing but the wrapper and the type changes.

## Acceptance

- [ ] None of the twenty-one is a `forwardRef` object; each passes the
      pass-through guard at the root it had (or keeps its named exception).
- [ ] `ref` is in each props table and in `API.md`, in the pattern of 03.
- [ ] A type test for a dialog root; a behaviour test that a ref on a menu's
      trigger holds the trigger.
- [ ] No screenshot moves.
- [ ] `pnpm check core` and `pnpm check:site` pass.
