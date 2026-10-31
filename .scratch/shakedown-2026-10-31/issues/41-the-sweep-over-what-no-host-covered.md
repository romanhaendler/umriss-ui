# 41: The sweep - what no host covered, on the finished code

Status:     done
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40

Spec: `../spec.md`, "Not covered by any host" and the needs-info list. Procedure: `docs/agents/shakedown/`
(hosts on packed tarballs of the finished code, in session scratch).

**What to build:** the run's own checks, where the shakedown had none - and a fix for every red they find.

- [x] **WebKit:** install the WebKit build matching the host's Playwright inside the host; rerun the hosts in `../reds/` (h4-h6, h5, h7, h8, h11, p10-p11, p2, p9) in WebKit; MultiSelect chips beside Chromium.
- [x] **A strict CSP** (`default-src 'self'`, no `unsafe-inline` for scripts; styles as the README states): core and table render, overlays open, toasts show, no CSP violation in the console.
- [x] **A long-lived tab:** a page with a table on live data (500 ms), toasts, freshness and a Popover opened and closed, run for an emulated 8 hours (fake clock plus real ticks); listeners, nodes, timers and heap do not grow.
- [x] **Tree rows under live data,** loaded and lazy (40): open branches, selection and focus survive updates.
- [x] **XLSX edge cases:** 100k rows, astral Unicode, dates before 1900 and around 1900-02-29, 32,767-character strings, formulas-looking text; opened with SheetJS and exceljs.
- [x] **What emulation can tell of the needs-info items:** a Popover with a focused input above an emulated on-screen keyboard (`visualViewport` shrink); the Combobox's and the palette's announcements recorded from the live region and the accessibility tree (double reading resolved where the tree shows it). What only a device or a real screen reader can settle is listed in the spec's Comments.
- [x] Every red becomes a unit test or `@quick` case and is fixed in this ticket (or, if large, a new ticket 43+ that blocks 42); the report goes under `## Comments`.

## Comments

**Delivered (2026-10-31, run coordinator).** The sweep ran in four parts on the finished code; each red
became a test and a fix. Three defects found and fixed, all in WebKit (part A); no new ticket needed.
Also done in the run: the quick browser suites of all seven packages green on the finished code, and
a real consumer application (core ^0.48) run against the 0.52 candidate - no library regression; it
follows two renames (SegmentedControl, RadioGroup `onValueChange`) and one test expects the old
exact toast close label.

## Part A - WebKit
The hosts of `../reds/` on packed tarballs of the finished code, WebKit (cached build 2359) beside
Chromium. h7 (60 specs): WebKit equals Chromium after one fix (the other failures are the host's stale
expectations, in both engines); p2 (42): equal; h4-h6, h5, h11, p9: only Safari's own behaviour (a
clicked button takes no focus, Tab skips buttons and checkboxes) and Intl data (fr-CH grouping) differ;
h8: equal but for the clipboard permission; p10-p11: nine scripts need CDP and cannot run in WebKit.
MultiSelect chips: the same geometry in both engines.
Fixed (three defects, tests):
1. A paged table in an opening Modal vanished in WebKit: its pitch was read through the Modal's
   `scale(0.96)` and fed back until "Maximum update depth exceeded" (`pinned.ts` `layoutHeight`,
   `linePitchScaled.test.ts`).
2. The first dialog closed returned focus to the body in WebKit - the pointer watcher was installed at
   the first opening, after the press (now at module load).
3. A dialog opened from a button inside another dialog returned focus to the outer dialog (WebKit)
   (`dialogOpenerPressed.test.tsx`).
Only a device can settle: real Safari with its keyboard setting (Option+Tab), VoiceOver's
click-to-activate path for focus return, iOS Safari.

## Part C - trees under live data, XLSX
Trees: loaded and lazy trees under a 500 ms tick of fresh rows keep open branches, selection, focus;
an unloaded branch is not asked again, a pending loading line survives ticks (`treeLiveData.test.tsx`).
XLSX (SheetJS and exceljs): 100k rows x 4 types read back right (~0.8 s each); astral Unicode intact;
`=1+1`, `@SUM`, `+cmd|...`, `-2` are string cells, no formula; 32,767 characters whole, longer cut,
never in a surrogate pair; dates from 1900-03-01 real dates in the table's zone, earlier ones ISO text
(documented); control characters removed, entities escaped. No defect. Note: formula-looking text has no
quote prefix - safe on opening, becomes a formula if a user edits the cell in Excel.
## Part D - what emulation can tell of the needs-info items
Popover above a shrinking visual viewport (Chromium, 390x700; only a pinch scale shrinks it in headless
Chromium): the panel flips above its anchor and stays in the visible part (338-394 → 238-294 of 0-350).
Combobox: one `status` region, one text per announcement ("4 options", "Nadia Petrova, selected",
"No matches"); the field keeps its name. Palette: the same shape ("7 finds", "Page the secondary on
call, Incident INC-1048"), the region inside the dialog. The option's name and the region's words are
the same string by design (`lib/announce.ts`: VoiceOver reads an active descendant poorly), so a reader
that follows `aria-activedescendant` may speak it twice; Chromium's AX tree shows `activedescendant`
null although the DOM attribute points at the option. No defect fixed. Only a device or a real screen
reader can settle: whether a real on-screen keyboard scrolls the field into view first and which
viewport events it fires; whether NVDA, JAWS or VoiceOver speak the active option and the region once,
twice or not at all; whether the last announcement left in the region is read in browse mode.
## Part B - strict CSP, a long-lived tab
Host: Vite production build on packed tarballs, `Content-Security-Policy: default-src 'self'`, Chromium.
CSP: core and table render, Popover and Modal open, a toast shows; no `securitypolicyviolation`, no
console output; styles load as a linked sheet, no `unsafe-inline` needed. Not tried under CSP: Select,
Tooltip, Drawer, DatePicker, CommandPalette.
Long-lived tab, emulated 8 hours (`page.clock`, 10-minute steps plus real ticks): a table rebuilt every
500 ms, a toast every 2 s, `useFreshness`, a Popover opened and closed every 10 minutes. Start → end:
DOM nodes 465 → 465, detached 0 → 0, JS listeners 334 → 334, window/document listeners 158 → 158,
timeouts/intervals/rAF 3/2/0 → 3/2/0, heap 5.57 → 5.82 MB (no trend). Two apparent leaks were the
driver's own (Playwright handles and CDP object groups holding nodes). No defect.
