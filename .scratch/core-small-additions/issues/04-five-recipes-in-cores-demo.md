# 04 - Five recipes in core's demo

Status: ready-for-agent
Type: task
Size: M

Blocked by: `.scratch/root-contract/issues/03-core-the-pickers-are-fields-and-the-name-is-aria-label.md`
Spec: `.scratch/core-small-additions/spec.md`

## What to build

Five wishes that the components already answer get an example each, on the page a reader looks it up from.
No API is added. Each lead says in one sentence why this is the application's code and not a component's.
The ticket waits for the root contract's ticket 03: the error summary focuses a DatePicker through its
`ref`, which reaches the trigger only from then.

- **A secret with reveal** (Input page): an `Input` for an API token whose `type` an `IconButton` beside it
  toggles between `password` and `text`, with `aria-pressed` and a name that says what a press does. The eye
  is an inline SVG standing for the application's icon set. The lead says why `Input` has no end slot:
  `chars` counts the field's own chrome (ADR-0041).
- **Files with progress and thumbnails** (FileInput page):
  - `value={[]}` keeps the field a drop zone; the files live in the example's state;
  - its own list shows a `ProgressBar` and a state per file (waiting, sending, done, failed), driven by a
    simulated upload, one file failing;
  - an image shows a thumbnail from `URL.createObjectURL`, revoked when the file leaves the list;
  - `accept="image/*"` and `capture="environment"` stand on the field, and the lead says that a phone then
    offers its camera.
- **A clickable Stepper** (`Stepper/04-move-on-yourself`): a done step's label becomes a button that sets
  `current`. After any step change, the focus moves to the new step's heading.
- **The form's error summary** (`FormField/04-check-an-invoice-on-submit`). On a failed submit:
  - a summary at the top of the form: a heading with the count and one link per problem, each focusing its
    field through the field's `ref`;
  - `announce(...)` says the count;
  - the focus moves to the first invalid field.

  A successful submit removes the summary.
- **An app shell** (Drawer page):
  - a header, and a side navigation of links with `aria-current="page"` on the current page's;
  - below a viewport width, read with the example's own few lines of `matchMedia`, the navigation moves
    behind a menu button into a `Drawer`, which closes when a link is chosen;
  - the lead names the router's own link (react-router's `NavLink` sets `aria-current` itself).

## Acceptance criteria

- [ ] A feature test on the invoice example: a failed submit focuses the first invalid field; the summary's
      link to the due date focuses the DatePicker's trigger; the announcement carries the count.
- [ ] A feature test on the Stepper example: choosing a done step makes it current and moves the focus to
      its heading.
- [ ] The shell example at 375 px shows the menu button and no side navigation; the Drawer opens from it and
      closes on a link.
- [ ] Every new or changed example passes the demo's page checks (accessibility, no sideways scroll at
      375 px) and has screenshots in both themes, new baselines reviewed.
- [ ] `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick core` pass.
