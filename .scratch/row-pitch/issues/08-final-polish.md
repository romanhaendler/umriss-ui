# 08 — Final polish

Status: ready-for-human
Type: polish
Blocked by: 07

The look of the pitch, accepted by the user on the rendered pages: the table
demo at phone and desktop width, in Firefox and Safari, light and dark - the
pagination, a grouped report, rows with checkboxes and folds, the alarm list,
a cut value's tip.

## Comments

Judged on the rendered table demo (2026-10-10), Chromium and WebKit, light and dark, 1280 and 390 px. Pictures: `reports/acceptance-2026-10-10/s2/`.

**One thing is left, and it is why this is not closed: Firefox.** The ticket asks for Firefox and Safari. WebKit stands for Safari; Firefox could not be started from the job that judged this (its launch timed out inside the command sandbox, and running outside it was not permitted). Nothing found in the two other engines suggests a difference, but that is an expectation and not a look. A pass over the five items below in Firefox closes the ticket.

- Pagination (page through shipments): fine. Ten rows at 36 px; the footer's rows select, "Page 1 of 7" and Back/Next stand on one line at 1280 px and stack cleanly at 390 px.
- Grouped report (dispatch report, long-values grouping): fine. 73 rows, every one 36 px, group rows, checkbox cells and the folds alike; the merged group cells leave their lines to the rows beside them by design.
- Rows with checkboxes and folds (selection, tree rows, row detail): fine. Rows are 36 px with a checkbox, a fold or an expander; nothing grows or sits off the line.
- Alarm list: fine. Six rows at 27 px, badges (High, Snoozed, Disabled) included; the dimmed rows keep the pitch.
- A cut value's tip (Formats, long values): fine. The tip opens beneath the cut cell, whole, in both schemes; at 390 px it is clamped inside the viewport (63 to 382 of 390).
- Nothing needed fixing, so no source changed.
