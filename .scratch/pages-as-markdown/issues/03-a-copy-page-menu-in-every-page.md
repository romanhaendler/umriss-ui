# 03: A "Copy page" menu in every page head

Status: done
Blocked by: 02 (The twins in development, and a head that follows navigation)
Spec: `.scratch/pages-as-markdown/spec.md`

**What to build:** At the end of the rubric line in every page head (scenarios page included) stands core's SplitButton, small and plain. **Copy page** fetches the page's twin and puts it on the clipboard; the label turns to "Copied" or "Failed" for 1600 ms and the same word goes into a polite status region of the page head. The menu holds **View as Markdown** (the twin in a new tab), **Open in Claude** (`https://claude.ai/new?q=<prompt>`) and **Open in ChatGPT** (`https://chatgpt.com/?hints=search&q=<prompt>`), with the prompt `Read <absolute .md address> — the documentation of <Page name> in <package>@<version>. Then help me use it in my React app.` ("the scenarios" on the scenarios page), URL-encoded.

- [x] Page suite: "Copy page" puts on the clipboard exactly the text served at the page's twin, and after an in-app jump the copied text follows the new page
- [x] The two "Open in" items carry the expected URLs with the encoded prompt; "View as Markdown" opens the twin
- [x] The menu opens, moves and closes with the keys of core's Menu; the status region announces "Copied"
- [x] The button fits the page head at 390 px without moving the title
- [x] Screenshot baselines of the page heads renewed once

## Comments

### Delivery report (2026-10-03)

- **Built.** `RubricLine` (`packages/demo/src/CopyPage.tsx`) is the rubric line
  of every page head, the scenarios page's included: the rubric, and at its end
  core's `SplitButton` (`sm`, `plain`) with core's `MenuItem`s. **Copy page**
  fetches `hrefOf(twinOfPlace(place))` inside a `ClipboardItem`, so that Safari
  keeps the click's permission (`writeText` where there is no `ClipboardItem`).
  The label and a polite `role="status"` region say "Copied" or "Failed" for the
  copy button's 1600 ms. The copy button's state is now the shared hook `useCopy`
  (`CopyButton.tsx`). The menu holds **View as Markdown** (the twin), **Open in
  Claude** and **Open in ChatGPT** (the spec's prompt, `encodeURIComponent`, the
  absolute twin address, "the scenarios" on the scenarios page). Each item uses
  `window.open(…, "_blank", "noopener")`. The trigger is named "More ways to use
  this page". `Demo` gains `version` from the manifest. The button sits in a box
  of no height, centred on the line, so the line keeps the rubric's height and
  nothing below moves. `.pageHead` reaches 8 px higher (padding, given back by a
  negative margin) so that the head's picture holds the whole button. The
  `Shell.tsx` header names this as the second exception to plain elements.
- **Tests.** `checks/page.ts` (`checkPage`, so core, table and schedule):
  - After an in-app jump to another page, the clipboard holds exactly the text
    served at that page's twin. The status region says "Copied" and then clears.
  - The menu opens on Enter and walks with ArrowDown/ArrowUp/Home/End
    (wrapping). Escape closes it and puts the focus back on the trigger.
  - The popups open the twin and the two assistants' URLs with the encoded
    prompt (the assistants are routed to an empty page). The scenarios prompt
    says "the scenarios".
  - At 390 px the line is as tall as the rubric, the button is centred on it,
    inside the head and after the rubric, and the page does not scroll sideways.

  Green in ui-light, table-light and schedule-light, together with the shell,
  accessibility and own-base suites.
- **Baselines.**
  - Every page-head picture of the five demos, in both themes (276).
  - Core's `palette-window`, light and dark, whose backdrop is the scenarios
    head.
  - `example-language--own-components`, light only (the dark one stays inside
    the tolerance). Its small ghost buttons stand 6 px further left than in the
    old picture, the same in three runs. Measured in the new build, the button
    carries exactly `Button`'s own `sm` rule (padding 0 6px, no margin, at the
    left of its stack); the old picture had more. The likeliest cause is that
    the style order of the demo bundle shifted with the shell's new imports of
    `SplitButton` and `MenuItem`. This was not checked against an old build.
  - Not moved, and red on main before this change: core's
    `drawer-beside-a-service-list`, `palette-resting`, `tokens-first-group`
    and `scenario-set-up-a-team`, and charts'
    `scenario-watch-latency-against-its-objective` (both themes). Their
    baselines still show the old header, the sidebar scrolled to the top, the
    old section headings, or the token table from before its ADR links. None
    of them shows a page head.
- **Deviations.** None from the ticket. No CHANGELOG entry: nothing that a
  package's caller installs changes.
