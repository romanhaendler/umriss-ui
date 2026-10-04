# Spec: Orientation on a page — a table of contents, previous and next, and a menu on the phone

Status: done

Origin: session of 2–3 Oct 2026. The brief, in the words it was given in:
"Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art,
sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen."
Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes;
this spec rests on `asis_site_ux.md` and `discoverability_interactivity.md`).
Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/demo-rework/spec.md` (the page anatomy: head, first
example, Examples, When to use something else, Keyboard, API, Known limits),
ADR-0037 (a page is a path, an example an anchor on it), ADR-0020 (one shell
for all five demos).

Blocked by: `shell-across-packages`. That spec rebuilds the header, which gains
the menu button here, and makes the active sidebar entry scroll into view, which
the drawer below reuses.

ADR: none.
Tickets: `issues/01`–`03`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

---

## Problem Statement

A page is long. At 1440 px the inventory measured core's Select page at
2,260 px, Button at 2,730 px, the table's First table at 4,602 px (80% of it
props tables: `TableProps`, its events, `TableOptions` and a fifty-row
`TableSnapshot`), and the scenarios pages at 3,600 to 6,550 px
(`asis_site_ux.md`). Once below the head, a reader has three
ways to find out what else is on the page, and all three are poor:

- **Scrolling.** Every section heading is set in the smallest type on the
  page, extra-small and semibold. It reads as a label, so the eye skims past
  it.
- **The sidebar.** It lists pages, not what is on them.
- **The palette.** It finds examples by title, but a reader has to know the
  title to type it.

When the page is done, nothing says where to go next. The last section ends,
and the reader goes back to the sidebar and finds their place in a list of 54.

On a phone it is worse. Below 900 px the sidebar moves under the page content.
On the Select page at 390 px the page is 5,445 px tall, and the 54 entries of
the navigation follow its props table. A reader on a phone sees no menu at all, and
the only way to another page is the palette or a long scroll.

Every library the research compared has the same three aids: a list of what
is on this page with the current section marked, links to the previous and
next page, and a menu button on narrow screens. Mantine, MUI, React Aria,
Base UI, Docusaurus, Starlight and Fumadocs all have them.

## Solution

Each component page gets:

- **"On this page"**, a list of its sections and examples. At 1200 px and
  wider it stands in a third column on the right, sticky, with the current
  section marked as the reader scrolls. Narrower, it is a closed disclosure
  directly under the page head.
- **Section headings at a readable size**, so the structure is visible
  without the list.
- **A previous/next pair at the foot of every page.** It follows the outline
  across rubric boundaries, the same order the sidebar shows.
- **A menu button below 900 px.** It opens the sidebar as a drawer from the
  left, with the current page in view and focus on it. Choosing a page closes
  it.

## User Stories

1. As a reader arriving on a long component page, I want to see a list of everything on it, so that I know before scrolling whether what I need is there.
2. As a reader, I want the list to show each example by its title, so that I can jump straight to the one that answers my question.
3. As a reader, I want the list to show the sections after the examples (When to use something else, Keyboard, API, Known limits), so that I can reach the props without scrolling past every example.
4. As a reader of a page with several props tables, I want each table listed under API by its type's name, so that I go straight to `TableSnapshot` without passing `TableProps` and `TableOptions`.
5. As a reader scrolling, I want the list to mark where I am, so that I keep my bearings on a 4,600-pixel page.
6. As a reader, I want clicking a list entry to bring that part under the header, not behind it, so that I see its heading.
7. As a reader, I want clicking an example in the list to mark it briefly as a palette jump does, so that my eye finds it.
8. As a reader, I want the address to name the example I jumped to, so that I can copy a link to it.
9. As a reader on a laptop at 1280 px, I want the list beside the content, so that it costs me no vertical space.
10. As a reader on a narrower window or a tablet, I want the list as a closed disclosure under the page head, so that it does not push the first example down.
11. As a reader on a phone, I want to open that disclosure, choose an entry and land there, so that I get the same overview a wide screen gives.
12. As a reader skimming without the list, I want section headings large enough to read as headings, so that the page's structure shows as I scroll.
13. As a reader who has finished a page, I want a link to the next page, so that I can read on without going back to the sidebar.
14. As a reader, I want the next link to name the page and its rubric, so that I know when I am crossing into a new subject.
15. As a reader on the first page of a demo, I want the previous link to lead to the scenarios page, so that the chain has a beginning.
16. As a reader on the last page, I want no next link, so that the chain has a clear end.
17. As a reader on a phone, I want a menu button in the header, so that I can reach every page without scrolling past the content.
18. As a reader opening the menu, I want it to show the page I am on and put focus on it, so that I can move to a neighbour with one key or one tap.
19. As a keyboard user, I want focus held inside the open menu and Escape to close it, so that I do not tab into the page behind it.
20. As a keyboard user closing the menu with Escape, I want focus back on the menu button, so that I do not lose my place.
21. As a reader choosing a page from the menu, I want the menu to close and focus to move to the new page's heading, so that a screen reader announces where I arrived.
22. As a reader rotating a tablet from portrait to landscape, I want the drawer to give way to the standing sidebar, so that I never see both.
23. As a screen reader user, I want the list to be a navigation landmark named "On this page" and the marked entry exposed as the current location, so that I can tell which section I am in.
24. As a reader who prefers reduced motion, I want jumps from the list to happen without smooth scrolling, so that the page does not glide.
25. As a reader of the scenarios page, I want the same list over its scenarios, so that I can reach the fourth scenario without scrolling past three.
26. As a reader, I want the list and the previous/next pair in light and dark, so that they read like the rest of the shell.
27. As a maintainer, I want the list built from the page's own sections and examples, so that a new example or section appears without anyone editing a list.

## Implementation Decisions

- **One shared component in the shell** renders "On this page". Its entries
  come from the same data the page renders: the page's examples in their
  order, and the sections that appear on that page. A section only appears
  where it has something to say, so the list shows exactly the headings
  present, never an empty entry.
- **What the list holds, in order:**
  1. the page name, leading to the top of the page;
  2. under it, the first (hero) example by its title, then **Examples** with
     each further example as an indented entry under it;
  3. **When to use something else**, **Keyboard**;
  4. **API** with each props table as an indented entry under it, named by
     its type;
  5. **Known limits**.

  Once `props-to-examples` gives each prop an anchor, props are **not**
  listed: 810 entries are an index, and the search finds them. On the
  scenarios page the list holds each scenario by its title.
- **Where it stands:**
  - **From 1200 px:** the page grid gains a third column on the right, wide
    enough for the longest example title in the shell's small text (a fixed
    width, about 15 rem). The list is sticky under the header and scrolls on
    its own when it is taller than the window.
  - **Below 1200 px:** it is a native disclosure, closed by default, placed
    directly after the page head (after the import line and the "about"
    text, before the first example), with the summary "On this page".
- **Scroll-spy:**
  - The current entry is the last heading whose top has passed a line 25% down
    the visible area, below the sticky header.
  - When the page is scrolled to its end, the last entry is current, so a
    short final section can still be marked.
  - The current entry carries `aria-current="location"` and the shell's
    current-entry style, as the sidebar's current page does.
  - An observer on the headings drives it, not a scroll handler measuring
    every frame.
- **Jumps:**
  - An example entry links to the example's own address (path plus anchor).
    The shell already turns that into a jump with the brief highlight, and
    the address names the example.
  - A section entry links to the section's anchor on the same path.
  - The shell treats an anchor that names no example as no change of place:
    the browser scrolls to it, and the scroll offset already used for
    examples keeps it clear of the sticky header.
  - Under reduced motion every jump is instant. That is already the shell's
    behaviour for examples and holds for sections too.
- **Section headings:** the page's section titles (Examples, When to use
  something else, Keyboard, API, Known limits) stay `h2` and take a size one
  step above the example titles (`h3`), in the shell's heading weight. The
  small rubric label above the page name keeps its label style. It is a
  label, not a heading.
- **Previous/next:**
  - A pair of links at the foot of every component page, after Known limits,
    in the outline's flat order (the order `ALL_PAGES` already holds).
  - Each link shows a small line "Previous" or "Next" with the rubric's name,
    and the page name below it.
  - The first page's previous link is the scenarios page; the last page has
    no next link.
  - On the scenarios page there is a next link only, to the first page.
  - They are ordinary links to the page addresses, so the shell's click
    handling moves without a reload and the prerendered text keeps working.
- **The drawer below 900 px:**
  - The header gains a "Menu" button at its far left, before the wordmark,
    shown only below 900 px (the breakpoint where the sidebar now falls under
    the content).
  - The sidebar is no longer placed under the content at that width. It
    opens in a native modal `<dialog>` at the left edge, full height, no
    wider than 20 rem or the screen minus a margin, whichever is smaller.
  - The dialog gives the focus trap, the Escape key and the backdrop for
    free. A click on the backdrop closes it.
  - On opening, the current page's entry is scrolled into view (the
    behaviour `shell-across-packages` adds to the standing sidebar) and
    receives focus.
  - Choosing an entry closes the dialog and moves focus to the new page's
    `h1`. Escape or the backdrop closes it and returns focus to the Menu
    button.
  - The button has `aria-haspopup="dialog"` and `aria-expanded` while the
    dialog is open.
  - The drawer reuses the sidebar's markup and styles. There are not two
    sidebars to keep in step.
  - Following the shell's rule, the drawer is built from plain elements, not
    from the library's `Drawer`. The surroundings of the exhibit are not made
    of the exhibit (the palette remains the one stated exception).
- **Widening past 900 px while the drawer is open** closes it. The standing
  sidebar takes over.
- **The prerendered text** that the pages build writes for search engines
  does not gain the list or the previous/next pair. It already has every
  heading and anchor, and a crawler reads those.

## Testing Decisions

- **What a good test is here:** it does what a reader does (scrolls, clicks
  an entry, presses Escape, opens the menu at 390 px) and checks what a
  reader sees (where the page is, which entry is current, where focus is).
- **Seam: the shell suite.** Every demo's `features-shell` spec calls it, and
  it gains probes for one page with several examples and an API section.
  - **At 1440 px:**
    - The list is visible beside the content.
    - Clicking an example entry lands on that example, highlighted, with the
      address naming it.
    - Clicking "API" puts the API heading below the header, not under it.
    - Scrolling to the end marks the last entry current.
  - **At 1000 px:** the list is a closed disclosure under the head; opening
    it and choosing an entry lands there.
  - **Previous/next:**
    - The next link on the last page of a rubric leads to the first page of
      the next rubric and names it.
    - The first page's previous link leads to the scenarios page.
  - **At 390 px:**
    - The sidebar is not in the page flow.
    - The Menu button opens the drawer with the current page focused.
    - Escape returns focus to the button.
    - Choosing a page closes the drawer and focuses the new `h1`.
  - **axe** runs with the drawer open and with the disclosure open, through
    the suite's existing accessibility helper.

  Prior art: the shell suite's sidebar and deep-link tests, and core's
  Playwright test of the drawer's focus trap and focus return.
- **Seam: the demos' jsdom smoke tests** keep rendering every page. They
  cover that the list builds for every page without throwing.
- **Screenshots:** each `page-*` image (the head down to the first example)
  changes where the disclosure or the third column enters the frame. The
  `example-*` images do not change, since an example's card is untouched.
  The adopting commit states the counts.

## Out of Scope

- **Listing props in the table of contents.** The search (`one-search`) and
  the prop anchors (`props-to-examples`) are the way to a single prop.
- **A table of contents in the prerendered HTML.**
- **Breadcrumbs.** The rubric label above the page name and the sidebar's
  marked entry already say where a page stands. A breadcrumb would repeat
  them with two levels.
- **Collapsing rubrics in the sidebar**, ruled out in `sidebar-tree`.
- **A "back to top" button.** The list's first entry is the top of the page.
- **The header's own contents**: wordmark, package switcher, links and theme
  (`shell-across-packages`), and the language switch (`language-switch`).

## Further Notes

- **Siblings:**
  - `sidebar-tree` sets the order previous/next follows.
  - `props-to-examples` adds anchors this list deliberately does not list.
  - `shell-across-packages` makes the standing sidebar scroll its current
    entry into view. The drawer calls the same behaviour on opening.
  - `a11y-and-finish` covers the remaining mobile cosmetics (scenario callouts,
    tables).
- **Numbers this rests on:**
  - Page lengths at 1440 px: Select 2,260 px, Button 2,730 px, First table
    4,602 px, scenarios pages 3,586–6,553 px.
  - At 390 px Select is 5,445 px tall, with the navigation after it.
  - Section titles are set at the extra-small text size.

**Acceptance:**
- [ ] Every component page and the scenarios page carry "On this page"; from
      1200 px as a sticky column with the current entry marked, below as a
      closed disclosure under the head.
- [ ] Every component page ends with previous/next in outline order across
      rubrics; the first leads back to the scenarios page.
- [ ] Below 900 px a Menu button opens the sidebar as a dialog with the
      current page focused; Escape and choosing behave as above.
- [ ] Section headings read as headings at a glance.
- [ ] Shell suite green in all five demos, axe included; no `example-*`
      picture changed.

## Comments

Delivered on `main` on 4 Oct 2026: every ticket under `issues/` is `Status: done` and carries its own delivery report. The whole effort was checked once more on `main` afterwards — lint, typecheck, unit and the full visual suite green.
