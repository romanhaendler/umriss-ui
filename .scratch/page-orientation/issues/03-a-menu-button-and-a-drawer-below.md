# 03: A menu button and a drawer below 900 px

Status: done
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

## Comments

**Delivered.** At 900 px and less, the sidebar is no longer in the page flow. The header has a "Menu" button at its far left: a three-line glyph named "Menu", with `aria-haspopup="dialog"` and `aria-expanded`. The button opens a native modal `<dialog class="shellDrawer">` named "Menu", full height at the left edge, `min(20rem, 100vw - space-8)` wide, over the theme's scrim. `Shell.tsx` builds the sidebar once as `rail` and places it beside the content or inside the dialog, depending on a `matchMedia("(max-width: 900px)")` hook (`useNarrow`, the same query as shell.css). There is one markup and one set of styles.
- **Opening:** the existing "active entry in view" logic is now the function `activeInView(rail)`. Opening calls it, then focuses the current entry.
- **Escape:** the platform closes the dialog and returns focus to the button.
- **Backdrop:** a click on the dialog itself closes it, since the rail fills the dialog to its edges.
- **Choosing a page:** any move while the dialog is open closes it, because it is modal, and focuses the new page's `h1`. Both `h1`s (Page, Scenarios) now carry `tabIndex={-1}` and show no ring.
- **Widening past 900 px:** an effect on the width closes the dialog, and the rail moves back beside the content.

The drawer uses plain elements, not the library's `Drawer`.

**Tests.** The shell suite (`packages/demo/checks/shell.ts`) has a new describe, "the sidebar on a phone, 390 px wide", with six tests:
- the sidebar is not in the flow, and the Menu button with its ARIA is visible;
- opening the drawer focuses the current page's entry (the `low` probe) and shows it in view, with the geometry checked;
- the focus trap (Shift+Tab never lands on the page), and Escape returns focus to the button;
- a click on the backdrop closes the drawer and returns focus;
- choosing a page closes the drawer and focuses its `h1`;
- widening to 1200 px closes the drawer and shows the standing sidebar;
- axe passes with the drawer open.

The existing phone header test now opens the Menu to find GitHub, npm and llms.txt at the sidebar's foot.

Results: `features-shell` and `features-page` in ui-light and table-light gave 129 passed and 1 skipped. `features-shell` in charts-, schedule- and calculation-light gave 144 passed and 10 skipped, the dark-only skips. `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` are green. Charts' `readout.jsdom` failed once under machine load, but it passes alone, and charts is untouched.

**Baselines.** None moved. The core screenshots `-g phone` (`toast-phone`, light and dark) pass unchanged. The first header line keeps its height. The drawer was checked by eye at 390 px in light and dark.

**Deviations.** None from the ticket. The page behind the open drawer is not scroll-locked. The rail has `overscroll-behavior: contain`, so scrolling it does not chain to the page.
