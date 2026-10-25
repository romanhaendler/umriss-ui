# Core's small additions: a "more" glyph, a palette shortcut that can be switched off, a label beside its field, and five recipes

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket 21 "Core's single wishes" (its Answer accepts the
Proposed answer, which holds every decision below that is not marked *(agent)*); findings
`.scratch/shakedown/core-screens.md` (the wish table and "Held up"), `accessibility.md` 5 and 10 and its
wishes, `design-system.md` (the `FormField` label wish), `mobile-touch.md` (the photo-capture wish),
`wishes.md` sections 1 and 3; ADR-0035, ADR-0039, ADR-0041, ADR-0045, ADR-0060.

## Problem Statement

The shakedown's core-only screens (login, settings, a wizard, an upload, an app shell) were built without
friction, apart from a handful of gaps that each cost a persona a workaround or broke a rule the library
holds elsewhere.

- **The library draws a "more" outside its own glyph set.** The table's row-actions trigger writes "⋯" as
  text. It is the one drawn character that the glyph specification and its check do not hold, and every
  application that puts a Menu behind an icon button draws its own.
- **The palette's "/" cannot be switched off** (WCAG 2.1.4), and it fires where it should not: on a focused
  native `<select>` (where it hijacks the type-ahead), in an ARIA textbox or combobox, and inside an open
  Modal, where it opens a second dialog over the first.
- **A dense settings form or a property panel cannot put its labels in a column beside the fields.** The
  FormField's root is a flex column, and no token reaches the label's placement.
- **Five things the components already allow are written down nowhere**, so each persona wrote them by trial:
  a secret with a reveal toggle, files with per-file progress and thumbnails, a Stepper whose done steps can
  be revisited, a form's error summary that announces and moves focus, and an application shell with a
  navigation that folds into a Drawer. The form example that exists neither focuses the first invalid field
  nor announces, though `accessibility.md` 10 is struck through as fixed.

## Solution

Three small additions to core, and five examples. No ADR: each is additive, and each is a commit message.

- **`MoreGlyph`**, three dots drawn to the glyph specification, exported beside the other glyphs. The
  table's row-actions trigger and core's own examples draw it instead of the text "⋯".
- **`useCommandPaletteShortcut(onOpen, { slash })`.** `slash: false` turns the single-key shortcut off;
  Cmd+K / Ctrl+K stays. The guard skips a `<select>`, an ARIA textbox, searchbox or combobox, and any key
  pressed inside an open modal dialog. Another key is the application's own listener calling the same
  `onOpen`, so remapping needs no API.
- **`FormField labelPlacement="start"`**: the label in a column of its own before the field, the hint or
  error under the field, the column's width a token. Where the place is too narrow for both, the field
  stacks as it does today.
- **Five recipes** in core's demo, each on the page a reader looks it up from, each lead saying in one
  sentence why it is the application's code: a secret with reveal, files with progress and thumbnails, a
  clickable Stepper, a form's error summary with announcement and focus, and an app shell.

## User Stories

1. As an application developer, I want a "more" glyph from the library, so that my Menu triggers match the
   library's own drawings without an icon set for one character.
2. As an application developer, I want the glyph to take the text colour and stay hidden from assistive
   technology, so that the IconButton around it carries the name, as with every glyph.
3. As a table user, I want the row-actions trigger drawn with the same stroke as every other glyph in the
   row, so that it does not read as a character in another font.
4. As the maintainer, I want the row-actions trigger held by the glyph check, so that nothing the library
   draws escapes the specification.
5. As a keyboard user who types slashes, I want an application setting that turns the "/" shortcut off, so
   that a single key never opens a dialog I did not ask for (WCAG 2.1.4).
6. As an application developer, I want `slash: false` to leave Cmd+K / Ctrl+K working, so that switching
   off the single key does not take the palette away.
7. As an application developer, I want to bind the palette to a key of my own with my own listener, so that
   remapping needs no API of the library's.
8. As a keyboard user on a native `<select>`, I want "/" to reach the select's type-ahead, so that the
   palette does not steal it.
9. As a user typing into a rich text editor or a custom combobox, I want "/" to be a character there, so
   that ARIA textboxes, searchboxes and comboboxes behave like inputs.
10. As a user inside an open Modal, I want neither shortcut to open the palette over it, so that two dialogs
    never stack.
11. As a developer of a dense settings form or a property panel, I want the labels in a column beside the
    fields, so that the form reads down one edge.
12. As that developer, I want the hint or error under the field and not under the label, so that the message
    stands where the eye already is.
13. As a design-system engineer, I want the label column's width as a token, so that every form of my
    application lines up on one edge.
14. As a phone user, I want a form with labels beside its fields to stack when the place is too narrow, so
    that neither the label nor the field is squeezed.
15. As an application developer, I want the label's text level with the field's text at either control
    size, so that the row reads as one line.
16. As an application developer, I want `labelPlacement` to change nothing about ids, `aria-describedby`,
    the required mark or the invalid state, so that the field is wired as it is today.
17. As an application developer typing an API token, I want an example of a reveal toggle beside an
    `Input`, so that I build it in a few lines with my own icon set.
18. As an application developer building an upload, I want an example with a progress bar and a state per
    file, so that I keep the files in my state and leave the field a drop zone.
19. As an application developer on a phone, I want the same example to show thumbnails of captured photos,
    so that a photo-capture field needs no component of its own.
20. As a wizard user, I want to go back to a done step by clicking it, so that I correct an earlier answer
    without pressing Back several times.
21. As a screen-reader user, I want the focus on the new step's heading after a step change, so that I hear
    where I am.
22. As a screen-reader user submitting a form with errors, I want the number of problems announced and the
    focus on the first invalid field, so that I know at once what failed and where.
23. As a sighted keyboard user, I want an error summary of links at the top of the form, each focusing its
    field, so that I reach every problem in one step, a Combobox and a DatePicker included.
24. As an application developer, I want an app shell example (a header, a side navigation of links that
    becomes a Drawer below a width, `aria-current="page"` on the page's link), so that I lay out the frame
    with the parts I already have and my router's links.

## Implementation Decisions

- **No ADR.** Every part is additive. Each is a commit message and a changelog entry.
- **`MoreGlyph`.**
  - Three dots in a row, each a zero-length stroke with round caps, at the specification's one stroke
    width on the square nominal box *(agent)*. A dot drawn so is a stroke, so the glyph check holds it with
    no exception.
  - Default size 12 *(agent)*: the size it is drawn at in the row actions' `sm` IconButton.
  - Exported from core beside the other glyphs, in core's README glyph row and in the glyph document's table
    of places.
  - The table's row-actions trigger draws it through core's public entry, as the table already takes the
    chevron. Core's own examples that write "⋯" in an IconButton (the Menu per row, the IconButton toolbar)
    draw it too.
  - Eye and search stay the application's icon set's (ADR-0039). No other glyph is added.
- **The palette shortcut.**
  - `useCommandPaletteShortcut(onOpen, options?)`, with `options.slash` (default `true`). The options type is
    exported as `CommandPaletteShortcutOptions` *(agent)*. Like `onOpen`, the options may be new on every
    render: the hook reads the latest, and does not resubscribe.
  - `slash: false`: "/" is no shortcut at all. Cmd+K / Ctrl+K is unaffected; WCAG 2.1.4 concerns single
    keys only.
  - "/" stays a character, and does not open, where the key's target, or an element around it, is an
    `input`, a `textarea`, a `select`, editable content, or carries the role `textbox`, `searchbox`
    *(agent: a searchbox is a textbox)* or `combobox`.
  - Neither shortcut opens while the key's target stands inside an open modal dialog: a `<dialog>` shown as
    modal, or an element with `aria-modal="true"` *(agent: both keys, since a second dialog over a modal is
    the defect whichever key opens it)*.
  - Remapping is the application's own `keydown` listener calling the same `onOpen`. The hook's
    documentation says so in one sentence; there is no `keys` option.
  - The shortcut example on the CommandPalette page gains the switch: an application setting, shown as a
    `Switch`, that passes `slash`.
- **`labelPlacement`.**
  - `labelPlacement?: "top" | "start"` on `FormField`, default `"top"` *(agent: "top" names today's
    layout)*.
  - With `"start"` the root lays out in a row that wraps *(agent: a wrapping row rather than a container
    query, since a container query cannot read a token and would make the root's width independent of its
    content)*:
    - the label first, as wide as the token `--u-label-width` *(agent: default 10rem)*;
    - then the field part, which holds the control and, under it, the hint or error. It takes the rest of
      the row, and needs at least 12rem *(agent: a literal; a second token waits for a need)*;
    - where the row cannot hold both, the field part wraps under the label, and the field reads as with
      `"top"`.
  - Label and field align on their first baseline *(agent)*, so the label's text stands level with the
    field's text at `sm` and `md`, and beside a Checkbox, a Switch or a RadioGroup.
  - Ids, `htmlFor`, `aria-describedby`, the required mark and the invalid state are as with `"top"`.
  - The token gets a comment in the tokens stylesheet, so that the Theming page lists it.
  - A FormField with `"start"` fills its place. In a row of fields it is not meant to stand; the doc comment
    says that it is for a column of fields.
  - It lands after `.scratch/theming-recipe/issues/05`, which puts the label's size on a token in the same
    rule.
- **The recipes** *(agent: which page each stands on)*. Each is one example file with a lead, and adds no
  API.
  - **A secret with reveal**, on the Input page: an `Input` whose `type` an `IconButton` beside it toggles
    between `password` and `text`, `aria-pressed` on the button, the eye drawn as the application's icon
    would be. The lead says why there is no end slot inside `Input`: `chars` counts the field's own chrome
    (ADR-0041).
  - **Files with progress and thumbnails**, on the FileInput page: `value={[]}` keeps the field a drop zone;
    the files live in the example's state, in its own list with a `ProgressBar` and a state per file
    (waiting, sending, done, failed), and a simulated upload. Images show a thumbnail from
    `URL.createObjectURL`, revoked when the file leaves the list. `accept="image/*"` and
    `capture="environment"` stand on the field, and the lead says that a phone then offers its camera.
  - **A clickable Stepper**: `Stepper/04-move-on-yourself` gains done steps to go back to. A done step's
    label is a button that sets `current`; after a step change the focus moves to the new step's heading.
  - **The form's error summary**: `FormField/04-check-an-invoice-on-submit` gains, on a failed submit:
    - a summary at the top of the form, GOV.UK style: a heading with the count, and one link per problem;
      each link focuses its field;
    - `announce(...)` with the count;
    - the focus on the first invalid field.

    Every focus goes through the control's `ref`: the root contract's field shape
    (`.scratch/root-contract/` 03) makes a DatePicker's ref its trigger, so the recipe waits for it.
  - **An app shell**, on the Drawer page: a header, a side navigation of links, `aria-current="page"` on the
    current page's link, and, below a viewport width, the navigation behind a menu button in a `Drawer`. The
    width is read by the example's own `matchMedia`, a few lines, since core has no media hook (decided in
    `.scratch/under-a-finger/`). The lead names the router's own link (react-router's `NavLink` sets
    `aria-current` itself).

## Testing Decisions

- A good test here does what a user does and asserts what they see or what the application receives: the
  `onOpen` call, the focused element by its role and name, a computed box. It never asserts on class names
  or internal state.
- **`MoreGlyph`**: the existing glyph checks of core and the table. Core's reads the new glyph; the table's
  reads the row actions, which no longer write the character. A unit test asserts that the row-actions
  trigger holds an SVG and no text, and keeps its name.
- **The shortcut**: jsdom unit tests beside the palette's existing ones (prior art: the shortcut tests in
  the palette's test file). "/" on the body opens; with `slash: false` it does not, while Ctrl+K does; "/" on
  a focused `select`, on `role="textbox"`, `"searchbox"` and `"combobox"` elements does not; neither key opens
  inside an element with `aria-modal="true"` or inside a modal `<dialog>`; a changed `slash` takes effect
  without remounting.
- **`labelPlacement`**: a jsdom unit test that the wiring (label `for`, `aria-describedby`, the required
  mark) is the same in both placements. The layout is a `@quick` check in core: in a wide place the label
  stands left of the field, as wide as the token, its baseline level with the input's text (within a pixel)
  at `sm` and `md`, the hint under the field; an unlayered `:root` rule for `--u-label-width` moves the
  field's edge; in a narrow place the field stacks under the label. Prior art: core's toast-inset checks set
  tokens with an added style tag and measure the box.
- **The recipes**: they are examples, so the demo's own gates hold them: the screenshot suite in both themes
  (new baselines, reviewed), the page checks (accessibility, no page overflow at 375 px), and the demo's
  smoke test. The error summary gets a feature test: a failed submit focuses the first invalid field, the
  summary's DatePicker link focuses the picker's trigger, and the announcement carries the count.

## Out of Scope

Every "never" of ticket 21's table, among them:

- a password component or an end-adornment slot in `Input` (ADR-0041);
- an icon set beyond `MoreGlyph`;
- Pagination in core, inline edit, a list item row, a signature pad;
- an AppShell, a NavLink or a bottom navigation component;
- a progress or thumbnail prop on `FileInput`, and a clickable-step prop on `Stepper`;
- an open button for the palette, and a `keys` option on its hook;
- a validation or error-summary helper (ADR-0060);
- Button `lg` and `fullWidth`, and +/- steppers on the Slider;
- right-to-left (ADR-0032).

Also out:

- The label's size as a token: `.scratch/theming-recipe/issues/05`.
- The long option lists and the async Combobox: `.scratch/long-option-lists/`.
- The pickers' `min` and `max`: `.scratch/date-jump-and-typed-entry/issues/06`.
- The palette's close cross under a finger: `.scratch/under-a-finger/` 08.

## Further Notes

- Whether three dots at the specification's stroke read heavy enough beside the "⋯" they replace is a look
  for the maintainer to judge in the table's screenshot comparison. A heavier dot would be an exception to
  the specification, and needs that judgement first.
- A label column suits a column of single fields. In a `Grid` of FormFields, `"top"` stays the right
  placement; the doc comment says so.
- The error summary moves focus to the first invalid field, as the Answer decided, not to the summary as
  GOV.UK does. The summary's links reach every other problem.
