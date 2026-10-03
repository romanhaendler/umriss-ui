# 01: "On this page" with the current section marked, and headings that read as headings

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/page-orientation/spec.md`

**What to build:** Every component page and the scenarios page carry a list of what is on them, built from the page's own data:
- the page name;
- the first example;
- Examples, with each further example under it;
- When to use something else and Keyboard, where present;
- API, with each props table under it by type name;
- Known limits.

On the scenarios page the list holds the scenarios.

From 1200 px the list stands in a sticky third column with the current entry marked by scroll-spy (`aria-current="location"`). Below 1200 px it is a closed disclosure right after the page head.

Sections get anchors, and the shell treats an anchor that names no example as a plain scroll, not a change of place. Section headings stay `h2` and are set one step above the example titles. Jumps are instant under reduced motion.

- [ ] At 1440 px the list stands beside the content. Clicking an example entry lands on it highlighted, with the address naming it.
- [ ] Clicking "API" puts the API heading below the sticky header, and the shell does not treat it as an unknown example.
- [ ] Scrolling to the end marks the last entry current. The current entry carries `aria-current="location"`, and the list is a navigation landmark named "On this page".
- [ ] At 1000 px the list is a closed disclosure under the head; opening it and choosing an entry lands there.
- [ ] The scenarios page lists its scenarios.
- [ ] Section headings render visibly larger than example titles.
- [ ] Shell suite (new probes, axe with the disclosure open) green in all five demos. The jsdom smoke tests still render every page. No `example-*` picture changes; the commit states the `page-*` counts.
