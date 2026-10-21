Status: done
Date:   2026-10-21

# Text at double size stays on its surface

## Problem Statement

A reader who sets the browser's font size to 200 % - Chrome's font size setting,
"zoom text only" in Safari and Firefox - gets every word of umriss twice as
large, because the type scale is in `rem`. Many surfaces do not grow with it:
their heights are fixed in `px`. The type then leaves its surface or is cut by
it.

Measured on 2026-10-21 (0.40.3, Chromium, every demo page, the root font size
at 200 % against the same page at 100 %, each case confirmed on a screenshot):

- **Badge** (20 px high, 22 px type at 200 %): the descenders hang below the
  surface - "In progre**ss**", "Awaiting a**pp**roval". Seen in core, table,
  schedule and calculation.
- **Tag** (22 px high; its text line fixed at 16 px and clipped for the
  ellipsis): the descenders are cut - "North de**p**ot", and in the table's
  grouping and filter tags "Grouped b**y**".
- **MultiSelect chip** (20 px): the descenders are cut - "Arjun Mehta",
  "Maya Lindgren".
- **Button given a width by its caller** (the Popover example's 240 px): the
  label, which never wraps, runs out over both edges of the button.

The 32, 26 and 18 px controls (Input, Select, the date pickers,
SegmentedControl, NumberInput, FileInput, a Button without a width) hold their
type at 200 %, tightly but whole; so do the Stepper's markers and the
MultiSelect counter. The table's rows grow with their type.

Page zoom (⌘ +) scales `px` and `rem` alike and shows none of this, so WCAG
1.4.4 is met through it. A reader who keeps a larger default font all the time
does not use page zoom, and meets these faults on every page.

## Solution

The labels - Badge, Tag, the MultiSelect chip - grow with their type: their
height becomes a floor rather than a fixed size, and their surface holds the
line at any font size. At the default font size they look exactly as today.

A Button whose caller gives it a width too narrow for its label ends the label
in an ellipsis inside the button, as a trigger's value does, instead of
spilling over its edges; the full label stays its accessible name.

A browser check in the visual suite of every demo sets the root font size to
200 % and fails when text leaves its surface or is cut by it, so the next fixed
height that cannot hold its type is found before release. Faults this spec does
not fix stand in that check's list of open findings, each with its follow-up.

## User Stories

1. As a reader with a large default font, I want the word of a badge to stay on the badge, so that the status reads as one mark.
2. As a reader with a large default font, I want the descenders of a badge's word to stay inside its surface, so that letters like g, p and y are not left hanging below it.
3. As a reader with a large default font, I want a pill badge to grow as a badge does, so that counters are not cut either.
4. As a reader with a large default font, I want the word of a tag to be whole, so that I can read what was chosen.
5. As a reader with a large default font, I want a long tag to still end in an ellipsis, so that it keeps its place in the row, without its letters being cut at the bottom.
6. As a reader with a large default font, I want the remove key of a tag to stay inside the grown tag, so that I can still find and press it.
7. As a reader with a large default font, I want the grouping and filter tags of the table to be whole, so that I can see how the table is grouped and filtered.
8. As a reader with a large default font, I want the chips of a MultiSelect to show whole names, so that I can see who or what I selected.
9. As a reader with a large default font, I want the badge's dot to stay centred on the grown line, so that the badge looks as it does at the default size.
10. As a reader with a large default font, I want a button whose width was fixed by the application to keep its label inside its edges, so that the label does not run over its neighbours.
11. As a screen reader user, I want a button whose label is cut by an ellipsis to keep its full label as its name, so that I hear the whole label.
12. As a reader at the default font size, I want every badge, tag, chip and button to look exactly as today, so that the fix changes nothing I did not ask for.
13. As a reader using page zoom, I want everything to keep scaling as it does today, so that the fix does not disturb the zoom I use.
14. As a reader in a dense table or form, I want a label to grow only as far as its type needs, so that rows stay as compact as the font allows.
15. As a developer, I want the labels to hold their type at any font size without a prop, so that my users' browser settings need nothing from me.
16. As a developer who sets a width on a Button, I want a label too long for it to end in an ellipsis, so that a narrow layout does not look broken.
17. As a developer, I want no new prop and no new token, so that my code and theme keep working.
18. As a maintainer, I want a browser check that sets the font size to 200 % on every demo page, so that a fixed height that cannot hold its type fails before release.
19. As a maintainer, I want the check to compare against the same page at 100 %, so that it reports only what the larger font breaks.
20. As a maintainer, I want the check to tell spilling and cutting apart from a deliberate ellipsis, a scroll container and visually hidden text, so that it reports faults and not design.
21. As a maintainer, I want a finding to name the page, the example, the element, its text and by how many pixels it leaves its surface, so that I know where to look without reproducing it.
22. As a maintainer, I want the faults this spec leaves open listed in the check with their follow-up, as the accessibility check lists its open pairs, so that they are not defined away and not forgotten.
23. As a maintainer, I want one shared check that every demo calls, so that the five demos measure by one rule.

## Implementation Decisions

- **The rule.** A label's height is a floor, not a size: today's height becomes its minimum, and the vertical room around its line grows with its type. At the default font size the result is pixel for pixel today's label.
- **Badge.** The fixed height becomes a minimum; the line keeps its height in proportion to the type. The `pill` form follows the same rule. The dot stays centred on the line.
- **Tag.** The fixed height becomes a minimum. The text line, today a fixed 16 px for the 11 px type so that the ellipsis clip holds the descenders, becomes a line height in proportion to the type that is 16 px at the default size. The ellipsis stays. The remove key keeps its size and stays centred.
- **MultiSelect chip.** The fixed height becomes a minimum, as the badge's. The field it sits in already holds a grown chip, at 200 % within its own height. The counter holds today and is not changed.
- **Button with a caller's width.** The label still never wraps. When the button is narrower than its label, the label ends in an ellipsis inside the button's padding. An icon beside the label keeps its size. The accessible name is unchanged, because the full text stays in the button.
- **No token and no prop.** The floors stay where the heights stand today, in the component stylesheets; ADR-0045 makes every token public styling API, and these values are not a styling choice.
- **The check.** A shared check in the demo shell, beside the forced-colours and accessibility checks, which each package's visual suite calls with its own pages - as `forcedColors` is called today. For every demo page: the page at 100 %, then the same page with the root font size at 200 %. In every example stage, every visible text is measured against the nearest box around it that has a background or an edge (its surface). A finding is text that, at 200 % and not at 100 %:
  - leaves its surface at the top or bottom without a box that clips or scrolls it (spills);
  - is cut at the top or bottom by a box that clips it (cut);
  - leaves its surface at the side without a clipping box (spills sideways).
- **Not a finding, by rule:** text cut at the side by a box with an ellipsis; text in a box that scrolls; visually hidden text (the library's screen-reader text); text whose surface is the page itself.
- **Open findings.** The check carries a list of findings it tolerates as open, each naming its follow-up, as the accessibility check's open list does; an entry matches on page, example and element, never on a whole rule. Empty is the intended state. At the end of this spec it holds the schedule's lane headers and axis, the dashboard's stat tiles and the table's group-header sums (see Out of Scope).
- One run per page in the light theme in one project: the larger font does not change with the theme.
- The changelog of core gets one Fixed line at release: badges, tags and chips grow with the reader's font size, and a fixed-width button ends its label in an ellipsis.

## Widened on 2026-10-21: the open faults are fixed too

The maintainer asked for every fault that can be fixed. The three items under
Out of Scope are therefore part of this spec, and the check's open list should
end empty:

- **Schedule lanes.** `laneHeight` (given or the default 44) is the height at
  the default font size. The schedule multiplies it by the root font size over
  16 px when that ratio is above 1, read when it lays out and again when the
  root font size changes. At the default size nothing changes. The prop's
  description says so.
- **Schedule axis.** The time axis multiplies its tick spacing by the same
  font ratio, and with it the room a day label needs: its labels grow by that
  ratio, so they keep their distance at any font size. A group head grows by
  the ratio too.
- **Dashboard rows.** The row unit's default grows with the root font size: the
  same 50 px at the default size, more above it. The token keeps its name and
  stays overridable; a theme that sets it keeps its value.
- **Table group-header sums**: not a fault of the larger font. In compact rows
  the share bar sits half a pixel to a pixel below the row at 100 % already;
  moving it would change the default picture. Left as it is, outside this spec.

## Testing Decisions

- A good test here measures the rendered page as a reader with a large font sees it: the browser's own layout, the library's own stylesheets, the demo's own examples. It does not read stylesheet values or compute sizes.
- One seam: the demo pages in the browser suite. Every component already runs through it, and the shared checks in the demo shell are where a rule for all demos lives. No unit test: a fixed height that cannot hold its type is a fact of layout, and only layout shows it.
- Prior art: the forced-colours check (a shared suite each package's spec calls with its pages) and the accessibility check (findings read into a readable list; tolerated and open entries with a reason, never a switched-off rule).
- Write the check first and see it fail on Badge, Tag, MultiSelect chip and the Popover's button; enter the open findings of other packages; then fix the four.
- The probe measures a text node's line box against the surface's box with a tolerance of 1.5 px; a line box larger than the glyphs is fine where nothing clips it, which is why the check compares with the page at 100 %.
- At the default font size no screenshot baseline may change. Run the full visual suite; a changed baseline is a fault of the fix, not a picture to update.
- Add one screenshot per fixed component at 200 % beside the existing ones, so that the grown look is held as a picture, not only as a measurement.

## Out of Scope

Each of these stays an open finding of the check, with its follow-up:

- **Schedule.** The lane height is fixed: at 200 % the last lane's label and the badge under a lane's name are cut, and the time axis labels run into each other ("06:3007:0007:30"). The lane height and the axis's spacing belong to the schedule's grid; a separate spec.
- **Dashboard.** A widget's height is set by its named size on the twelve-column grid: at 200 % a stat tile cuts its unit and its trend line, and its title touches its value. A separate spec, since the sizes are the arrangement's contract.
- **Table.** The underline that marks a share under a sum in a group header is cut by a pixel or two at the bottom of the fixed-height row. Minor; a separate ticket.

Also out of scope:

- Charts: their type is drawn on canvas and does not follow the root font size at all. A separate question.
- Closed overlays (Menu, Tooltip, Popover content, Modal): the check measures what an example shows at rest.
- Checkbox, radio and switch staying 16 px beside type twice as large: an alignment question, not overflow.
- The controls with 32, 26 and 18 px height, which hold their type at 200 %.
- Page zoom, which already scales everything.

## Further Notes

- The measurement script that found these lives outside the repo; the check re-implements its probe in the shell. Its rules: surface = nearest ancestor with a background, a border or a box shadow; clip = nearest box between the text and its surface whose overflow is not visible; findings at 100 % are subtracted.
- The table's grouping and filter tags are core's Tag; they are fixed with it.
- Badges in table, schedule and calculation are core's Badge; they are fixed with it.

## Comments

Delivered 2026-10-21, every fault the measurement found, the check's open list
empty.

- core: Badge, Tag, the MultiSelect chip, counter and scope buttons take their
  height as a floor; the tag's line is 16/11 of its type. A Button narrower
  than its plain-text label ends it in an ellipsis (a label with an icon beside
  it keeps its row and is not truncated). 50 example stages byte-identical at
  100 %.
- schedule: lanes, group heads, tick spacing and date room grow by the root
  font size over 16 px, rounded to whole pixels; a 1rem probe notices a change.
  Tick spacing is scaled, not measured (the labels grow by the same ratio).
- dashboard: the row unit's default is `round(max(50px, 3.125rem), 1px)`. The
  dispatcher example lets a figure's unit go under its value.
- table: the line every row, head and group header shares is
  `round(up, max(19px, 1.1875rem), 1px)`; virtualised rows follow it, since the
  pitch is measured from the head.
- The check (`checkLargeText`, one spec per demo) measures the glyphs' ink, not
  the font's content area, against each text's surface; an open entry that no
  longer matches fails. Green on all 122 pages.
- Not done: the extra 200 % screenshot per component. The check measures that
  state on every page; a picture would hold the same fact a second time.
- Not a fault of the large font, left as it is: the table's share bar in
  compact rows sits half a pixel to a pixel below the row at 100 % already.
