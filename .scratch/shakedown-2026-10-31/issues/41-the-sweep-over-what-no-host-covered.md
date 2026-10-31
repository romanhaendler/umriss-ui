# 41: The sweep - what no host covered, on the finished code

Status:     ready-for-agent
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40

Spec: `../spec.md`, "Not covered by any host" and the needs-info list. Procedure: `docs/agents/shakedown/`
(hosts on packed tarballs of the finished code, in session scratch).

**What to build:** the run's own checks, where the shakedown had none - and a fix for every red they find.

- [ ] **WebKit:** install the WebKit build matching the host's Playwright inside the host; rerun the hosts in `../reds/` (h4-h6, h5, h7, h8, h11, p10-p11, p2, p9) in WebKit; MultiSelect chips beside Chromium.
- [ ] **A strict CSP** (`default-src 'self'`, no `unsafe-inline` for scripts; styles as the README states): core and table render, overlays open, toasts show, no CSP violation in the console.
- [ ] **A long-lived tab:** a page with a table on live data (500 ms), toasts, freshness and a Popover opened and closed, run for an emulated 8 hours (fake clock plus real ticks); listeners, nodes, timers and heap do not grow.
- [ ] **Tree rows under live data,** loaded and lazy (40): open branches, selection and focus survive updates.
- [ ] **XLSX edge cases:** 100k rows, astral Unicode, dates before 1900 and around 1900-02-29, 32,767-character strings, formulas-looking text; opened with SheetJS and exceljs.
- [ ] **What emulation can tell of the needs-info items:** a Popover with a focused input above an emulated on-screen keyboard (`visualViewport` shrink); the Combobox's and the palette's announcements recorded from the live region and the accessibility tree (double reading resolved where the tree shows it). What only a device or a real screen reader can settle is listed in the spec's Comments.
- [ ] Every red becomes a unit test or `@quick` case and is fixed in this ticket (or, if large, a new ticket 43+ that blocks 42); the report goes under `## Comments`.

## Comments
