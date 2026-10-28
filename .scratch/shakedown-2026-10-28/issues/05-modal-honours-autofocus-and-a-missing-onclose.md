# 05: Modal and Drawer honour autoFocus, and survive a missing onClose

**What to build:** An edit dialog opens with the cursor in the field marked `autoFocus`. Today the dialog opens after React has focused the field, and the dialog's own focusing steps move focus to the first tab stop, the Close button. After the dialog opens, an element inside it that holds focus from `autoFocus` keeps it; without one, the dialog's focusing steps apply as today. No new prop. Also: a `<Modal open>` without `onClose` (a JavaScript host) no longer throws on Escape or the close button; DEV warns once and names `onClose`. Spec: `../spec.md` ("Modal and Drawer initial focus", "Modal without onClose"); repros: `../personas/p4-jonas.md` 2, `../personas/p1-lena.md` 7.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A browser test: a Modal and a Drawer whose second field has `autoFocus` open with that field focused
- [ ] A browser test: without `autoFocus`, focus lands where it does today
- [ ] Focus returns to the trigger on close, as today
- [ ] A component test: Escape on a Modal without `onClose` throws nothing and warns once naming `onClose`
- [ ] Commit body: `Changelog core Fixed:` lines
