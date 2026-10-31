# 28: Print - calculation, schedule, dashboard, alarms and charts

Status:     done
Blocked by: 27

Spec: `../spec.md`, decision 7; roadmap P3. Sources: earlier-runs-open calculation.md 9, operator-screens 5.

**What to build:** a shift log, a daily balance or a plan prints whole, on the print base of 27.

- [x] The calculation prints its folded levels open and hides its disclosure buttons.
- [x] Schedule, dashboard and alarms print their content without chrome (edit bar, menus, buttons); charts keep their print redraw.
- [x] A print example per package; `page.pdf()` output looked at as a reader; `pnpm check` of each package touched.

## Comments

**Delivered (2026-10-31, run coordinator).** Ticket 27's pattern in calculation (every derivation printed
open, disclosure buttons off), schedule (chevrons, grips, tooltip, focus off; light), dashboard (edit bar,
grips, menus off; widgets whole; light), alarms (bar buttons off), charts (tooltip and "show all" off,
legend chips and colour-bar steps `print-color-adjust: exact`); one print example, a CSS-reading test and
a **Print.** paragraph per package. Looked at the chart and the dark calculation PDFs: right.
Decided: charts keep the app's theme in print (drawn at draw time). Left: the alarm list with every
column is wider than portrait A4 - the docs say to print it landscape; a real fix belongs in the table
(rows have one pitch, so cells cannot wrap).
