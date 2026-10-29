# 02: One command screenshots a demo example

**What to build:** An agent or a contributor sees a change in one line: a workspace script takes a package, a page and an example id - optionally a button to click first, a viewport width, light or dark, the touch opt-in - and writes a PNG of that example from a dev server on a free port, printing the page's console errors. CONTRIBUTING names it. Spec: `../spec.md` ("Screenshot command").

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The command writes a PNG of a named example of each of the seven demos (smoke-checked by hand for two)
- [ ] A click option opens a popover or dialog before the shot; width, theme and touch options take effect
- [ ] Console errors of the page are printed; the server is stopped afterwards
- [ ] CONTRIBUTING names the command
