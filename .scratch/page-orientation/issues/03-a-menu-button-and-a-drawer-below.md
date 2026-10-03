# 03: A menu button and a drawer below 900 px

Status: ready-for-agent
Blocked by: `shell-across-packages` 02 (The header connects the five packages), `shell-across-packages` 03 (Moving inside a demo behaves like moving between documents)
Spec: `.scratch/page-orientation/spec.md`

**What to build:** Below 900 px the sidebar no longer stands under the content. A "Menu" button at the far left of the header (`aria-haspopup="dialog"`, `aria-expanded`) opens the same sidebar markup in a native modal dialog from the left, at most 20 rem wide.
- **On opening:** the current page's entry is scrolled into view and focused.
- **Choosing a page:** closes the dialog and focuses the new page's `h1`.
- **Escape or the backdrop:** closes it and returns focus to the button.
- **Widening past 900 px:** closes it.

The drawer is built from plain elements, not the library's Drawer.

- [ ] At 390 px the sidebar is not in the page flow, and the Menu button is visible in the header.
- [ ] Opening the menu shows the current page focused. Tab stays inside the dialog.
- [ ] Escape and a backdrop click close it, with focus back on the Menu button.
- [ ] Choosing a page closes it and moves focus to the new page's `h1`.
- [ ] Resizing above 900 px while it is open closes it, and the standing sidebar shows.
- [ ] axe passes with the drawer open. Shell suite green in all five demos.
