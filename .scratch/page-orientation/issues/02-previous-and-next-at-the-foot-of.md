# 02: Previous and next at the foot of every page

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/page-orientation/spec.md`

**What to build:** Every component page ends, after Known limits, with a previous/next pair in the outline's flat order across rubric boundaries. Each link shows "Previous" or "Next" with the rubric name and the page name.
- The first page's previous link leads to the scenarios page.
- The last page has no next link.
- The scenarios page has a next link to the first page.

They are ordinary links to page addresses, so the shell moves without a reload. The prerendered text does not gain them.

- [ ] On the last page of a rubric, "Next" names and opens the first page of the next rubric.
- [ ] The first page's "Previous" opens the scenarios page; the last page shows no "Next".
- [ ] The scenarios page shows only "Next", to the first page.
- [ ] Following a link moves in the app without a reload, and the address is the page's path.
- [ ] Shell suite green in all five demos.
