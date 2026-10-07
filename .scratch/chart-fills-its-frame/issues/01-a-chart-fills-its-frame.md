# 01: A chart fills its frame, beside the OEE calculation in the kiln line

**What to build:** A chart without `height` fills its frame and never goes below its floor of 300 px; a number stays a fixed height. A `Card` that the grid stretches hands the extra height to its body, so that "Grid → Card → Chart" fills with nothing written. The kiln line scenario shows it: the OEE calculation and the tile length chart side by side in a grid of two columns, the chart following as the calculation's groups fold open and closed. See `../spec.md` for every decision and ADR-0050 for the why.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Before the card change: every place in the workspace's sources and demos that puts something other than `CardHeader` and `CardBody` directly into a `Card` is found and listed in the delivery report, with what the change does to it
- [x] `Card` is a flex column; the header keeps its height; the body, and in a collapsible card the fold's wrapper, take the rest; the fold's inner element lets the body fill it; folding works as before
- [x] Chart without `height`: root is 100% high with a 300 px minimum; with a number, that fixed height and no minimum; `style` still goes last, so `minHeight` and `height` set there win
- [x] The `height` description and its `@default` state the fill and the floor; the `style` description no longer says a height set there is unknown to the scene
- [x] Kiln line scenario: OEE and tile length regions side by side in a two-column `Grid`, the tile length chart without `height`; the other regions keep theirs; the callouts still sit on their regions
- [x] Feature test on the kiln line scenario, next to the existing control room tests: the two cards end on one line and the plot area fills its card's body; folding an OEE group open grows the plot area by the row's growth; folding it closed shrinks it back to its first height. Waits on the measured box, never on a fixed timeout
- [x] Screenshot and forced-colours suites of charts and core: a chart standing alone without `height` and a card that is not stretched do not move; every baseline that changes is looked at and listed in the delivery report as accepted on purpose
- [x] "Changed" entries in the changelogs of charts and core, naming the visible change: a chart without `height` in a frame taller than 300 px now fills it; direct children of a card no longer collapse their margins
- [x] Lint, types, unit, build and visual green

## Comments

### Delivery report

- Card children (step 1): every `<Card>` in sources and demos holds `CardHeader`/`CardBody` directly, except four. The core Splitter examples (01-04) put a `Splitter` with `height: 100%` directly in a fixed-height Card (now a flex item of definite height: unchanged). Two schedule examples (Placing/01, Where-it-may-go/02) put a draggable `div` directly in a Card (no margins, width stays: unchanged). Nothing in the library sources renders a Card.
- Baselines changed, both on purpose: `scenario-watch-a-kiln-line` light and dark (core screenshots). The Tile length and OEE regions now stand side by side in a two-column Grid, after Plan, and the chart fills its card. The skip-link list follows the new order (Plan, Tile length, OEE). No chart or forced-colours baseline moved otherwise.
- New feature test in `features-control-room.spec.ts`: red before the change (plot did not follow the row), green after.
- Totals: lint, typecheck, build clean; unit 4289 passed; visual 3171 passed, 987 skipped, 2 failed (the two kiln line baselines above), both green after `--update-snapshots`.
