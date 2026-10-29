# 04: A dialog mounts its children when it opens

**What to build:** An edit dialog opens with the cursor in its `autoFocus` field across React versions: the Modal's and Drawer's children mount when the dialog opens (after `showModal()`), and unmount once the exit has ended, so React's own `autoFocus` focuses a visible field. The read of React's private props goes; ConfirmDialog and CommandPalette follow the same choreography. A closed dialog keeps no state of its children - confirmed by the maintainer: a host that wants state to survive closing keeps it itself. The `autoFocus` examples of Modal and Drawer get the form gap between their fields. The dialog choreography's ADR gets a dated amendment. Spec: `../spec.md` ("Modal and Drawer initial focus").

**Blocked by:** 01 (the worker runs the dialog browser specs)

**Status:** ready-for-agent

- [ ] `features-dialog-focus` (browser) green, run by the worker: Modal and Drawer with `autoFocus` open with that field focused; without it focus lands on the first tab stop; focus returns to the trigger
- [ ] No read of React's private keys anywhere in the packages (a grep in a unit test or the shrink guard)
- [ ] Exit choreography unchanged (existing tests); ConfirmDialog and CommandPalette open and focus as before
- [ ] The two examples look like a form (screenshot command, both themes)
- [ ] ADR amended; commit body `Changelog core Changed:` with `Migration:` (state that must survive closing belongs to the caller)
- [ ] An existing test that needs the dialog opened first is named in the commit body with its reason
