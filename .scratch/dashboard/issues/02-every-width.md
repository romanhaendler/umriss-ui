# 02: Every width

**What to build:** A reader sees the same arrangement on every screen wide enough for the grid - each widget beside the same neighbours - and below the width at which a column would be too narrow to read, the same widgets one under the other in the same order. On a very wide monitor the dashboard stops growing. The reader can divide the dashboard with a heading across the full width, and an empty dashboard says so. See `spec.md` (The two forms, Maximum width, The frame, Empty).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The column count is twelve at every width at which a column is at least the minimum width (about 52 px at a 12 px gap); below it the dashboard is a list: one widget per row, full width, in the stored order, each at its size's height.
- [ ] The form is decided on the dashboard's own width, not the window's, without measuring in script, so the server's markup and the first frame are right.
- [ ] The maximum width (about 1560 px), the row unit (about 50 px) and the gap (12 px) are tokens; the dashboard stands at the start of its container.
- [ ] The library ships a heading widget type: one size, `full`, one row, its text as its options, drawn as a title without a card; the application chooses whether to use it.
- [ ] A dashboard without widgets says that it is empty.
- [ ] Wording for the empty state in English and German.
- [ ] Browser tests: at 1280, 1920 and 2560 px every widget has the same neighbours; at 1920 and 2560 px the dashboard has its maximum width; at 820 px it is still the grid; at 390 px it is the list in the stored order.
- [ ] Screenshots of the demo page in both themes and under forced colours; the accessibility suite passes.
