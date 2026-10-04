# Spec: A language switch — every example in English or German, one click

Status: done

Origin: session of 2–3 Oct 2026. The brief, in the words it was given in:
"Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art,
sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen."
Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes;
`discoverability_interactivity.md` names the EN/DE switch a cheap distinction
no compared library offers this way). Roadmap of all sixteen specs:
`.scratch/docs-roadmap/spec.md`.

Builds on: ADR-0018 (everything in the workspace is English), ADR-0019 (two
wordings ship, English is the default, German as the subpath
`@umriss-ui/core/wording/de`), ADR-0024 (the formats are English, German
formats travel in the same subpath), ADR-0031 (the charts carry their own
wording, passed per chart), ADR-0037 (one address per page, prerendered).

Blocked by: `shell-across-packages`. That spec rebuilds the header the switch
stands in, and sets the scheme for remembered shell settings (the theme) that
the switch joins.

ADR: none. The switch is the demo's, not the library's. It uses the seam
Tickets: `issues/01`–`02`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.
ADR-0019 and ADR-0024 already describe, exactly as an application would.

---

## Problem Statement

German is a real feature of umriss. Every component's own words (the empty
states, the buttons inside a date picker, the screen reader's sentences) and
every notation (dates, numbers, durations) ship twice. A German application
takes both with one import line (ADR-0024). It is one of the few things the
library offers that the large libraries do not offer in the same form. The
research found no compared library whose documentation lets a reader see
every example in a second language.

On the site it is nearly invisible:

- **Five examples in the whole workspace show it.** These are core's
  Language page (five examples), one example in calculation (Given, "in
  German") and one in the charts (keyboard and screen reader).
- **A reader evaluating the table, the schedule or the calculation for a
  German product** cannot see what "Keine Einträge", a German date in a filter,
  or a German readout of a plan looks like without writing the application
  first.

The question the reader actually has, "what does this look like for my
German users?", is answered nowhere except on one page.

## Solution

A two-way switch, **EN / DE**, in the header of every demo whose components
read core's language: core, table, schedule and calculation.

- **Choosing DE** renders every example and every scenario inside the
  library's own language provider with `GERMAN_WORDING` and
  `GERMAN_FORMATS`, the line an application writes once at its root.
- **The page's text stays English:** lede, sections, props tables and
  headings. That text is documentation (ADR-0018), and the switch shows what
  the library says, not a translated manual.
- **A one-line notice** at the top of the page says what is happening and
  that the code shown is unchanged.
- **The choice is remembered across visits and across the four demos,** like
  the theme.
- **The charts demo carries no switch.** Its wording is a prop per chart
  (ADR-0031), and a switch that changes nothing there would be worse than
  none.

## User Stories

1. As a developer evaluating umriss for a German product, I want to switch every example to German, so that I see what my users will see before writing any code.
2. As that developer, I want dates, numbers and durations in German notation too, so that I see `17.03.2026` and `1.284,5`, not only translated words.
3. As a reader, I want the switch in the header next to the theme, so that I find it where display settings live.
4. As a reader, I want the switch to show which language is active, so that I never have to guess what I am looking at.
5. As a reader, I want switching to take effect at once on the page I am on, without a reload or a jump, so that I can compare the two by flipping.
6. As a reader, I want my choice remembered when I come back, so that I do not have to set German every visit.
7. As a reader moving from the core demo to the table demo, I want German to stay on, so that the four demos behave as one site.
8. As a reader with German on, I want the scenarios in German as well, so that the composed screens show the whole product in my users' language.
9. As a reader with German on, I want a short notice saying the examples render in German and the code shown is unchanged, so that I am not surprised when the copied code renders in English.
10. As a reader with German on, I want that notice to link to the Language page, so that I learn the one line that does this in my application.
11. As a reader with German on, I want the page's prose, headings and props tables to stay in English, so that the documentation stays the one text it is.
12. As a reader with German on, I want the labels an example writes itself ("Delivery date", "Pump 3") to stay as the example wrote them, so that I see exactly where the library's words end and my application's begin.
13. As a reader of the Language page, I want its examples to keep showing their own fixed languages (the side-by-side example stays side by side), so that switching does not break what they demonstrate.
14. As a screen reader user, I want examples announced in German pronunciation while German is on, so that "Keine Einträge" is not read with English phonetics.
15. As a screen reader user, I want the page's English prose still announced as English, so that only the examples change language.
16. As a keyboard user, I want the switch reachable in the header's tab order and operable with Space and Enter, so that it needs no pointer.
17. As a screen reader user, I want the switch exposed as a named group of two pressed buttons, so that I hear "Language of the components, Deutsch, pressed".
18. As a reader of the charts demo, I want no switch that does nothing, so that the header never offers a control without an effect.
19. As a reader of the charts demo, I want the Installation page to say how German is passed to a chart, so that the absence of the switch is explained where it matters.
20. As someone sharing a link, I want the address to be the same in English and German, so that one page has one address and a search engine sees no duplicate.
21. As a search engine, I want every prerendered page in English, so that the indexed text is the documentation's language.
22. As a reader using the palette with German on, I want the palette and the shell's own words to stay English, so that the frame of the site does not change under me.
23. As a maintainer, I want the screenshot baselines to stay English, so that switching costs no new picture set.
24. As a maintainer, I want one test proving that German reaches the examples, the scenarios and the formats, so that a change to the shell cannot quietly cut the switch off.
25. As a maintainer, I want the switch to use the library's public seam and nothing private, so that it proves what an application can do.

## Implementation Decisions

- **Where it stands:** in the header's right-hand group, directly before the
  theme control. It is a group of two buttons, labelled "EN" and "DE", with
  `aria-pressed` on the active one and the group named "Language of the
  components". Each button's accessible name is the full language name
  ("English", "Deutsch"). It is built from plain elements, by the shell's rule
  that its surroundings are not made of the exhibit. Below 560 px the group
  stays and the search field shrinks first, as it does today.
- **Which demos have it:** the shell takes the switch as an option of the
  demo. Core, table, schedule and calculation pass it; charts does not. The
  demo declares it, because the shell cannot know whether a demo's components
  read core's language.
- **What it changes:** the shell wraps the scenarios page and every example
  stage in the library's language provider with the German wording and the
  German formats. It is the same pair, from the same subpath, that ADR-0024's
  one line imports.
- **What it does not change:**
  - the shell's own words, which are set apart through their own language
    seam and stay English;
  - the page's prose, headings, props tables, keyboard tables and known
    limits;
  - the code blocks;
  - the prerendered text.

  An example that sets its own language provider keeps it. The innermost
  provider wins, which is the library's rule, so the Language page's
  side-by-side and per-entry examples stay as they are.
- **What an example wrote itself** (field labels, data, the scenarios'
  invented world's names) stays as written. That is not a gap to fill. It is
  the point: the reader sees exactly what changes when an application
  switches the library, and what the application still owns.
- **The notice:** while DE is active, one line stands at the top of every
  component page and of the scenarios page: "The examples render in German:
  `GERMAN_WORDING` and `GERMAN_FORMATS` at the root, as on [Language]. The
  code shown is unchanged." It is part of the page text, not an overlay, and
  disappears when EN is chosen.
- **The language attribute:** every example stage and every scenario stage
  carries `lang="de"` while DE is active. The document keeps `lang="en"`.
- **Remembering:**
  - The choice is stored in the browser's local storage under
    `umriss-ui:language`, with the value `en` or `de`, following the
    `umriss-ui:<setting>` scheme `shell-across-packages` sets for the theme.
  - All demos share one origin under the site, so the choice carries across
    them.
  - Read once on start. No value means English, the library's default.
  - Unreadable storage (a private window, storage blocked) means English, and
    the switch still works for the visit.
  - No pre-paint script is needed: the prerendered text is English anyway,
    and the app renders the examples after it starts.
- **The address carries no language.** One page, one address (ADR-0037).
  German is a view of the same page, not a second page, so the sitemap, the
  canonical links and the prerendered text are unchanged.
- **The charts demo,** having no switch, gains one sentence on its
  Installation page: the charts' words come from the `wording` prop per chart
  (`GERMAN_CHARTS_WORDING` from `@umriss-ui/charts/wording/de`), and the
  keyboard and screen reader example shows it. The schedule draws with charts
  parts but reads its words through core's provider. That is what the
  schedule's German readout test already proves.

## Testing Decisions

- **What a good test is here:** it presses DE and reads what a reader reads:
  a German word from the library, a German date, the notice. It checks that
  the frame stays English. It never inspects how the provider is wired.
- **Seam: the shell suite.** It gains a probe per demo that has the switch: a
  page and a text the library writes there, in both languages. Examples are
  core's DatePicker (a date and a button label), the table's empty state, and
  the schedule's readout.
  - Pressing DE changes that text to German and the date to German notation.
  - The notice appears with its link.
  - The page's `h1` and the palette's placeholder stay English.
  - A reload keeps German.
  - Pressing EN restores everything.
  - The example stage carries `lang="de"`, and the document keeps `lang="en"`.
  - The charts demo passes no probe, and the suite asserts that it shows no
    switch.

  Prior art: the shell suite's theme-independent behaviour tests, and the
  calculation's and schedule's sentence tests in English and German.
- **axe** runs once with German on, through the suite's existing
  accessibility helper.
- **Screenshots stay English.** The suites start without a stored language,
  so every baseline is unchanged.

## Out of Scope

- **Translating the documentation.** Prose, props descriptions and the agent
  text stay English (ADR-0018). A German site would be a product decision
  of its own.
- **A language segment in the address** (`/de/core/…`) and translated
  prerendered pages.
- **A switch in the charts demo,** and a wording provider for the charts.
  ADR-0031 chose the prop, and a demo setting is no reason to add a context
  to the one package that depends on nothing.
- **Other languages.** Two ship, and the switch has two positions.
- **A density switch.** Sizes are shown on the Sizes page, where the
  mechanism is explained.
- **Changing the code blocks to show the provider line while German is on.**
  The notice says it once, and a code block that differs from the file it
  shows would break the rule that the file is the example.

## Further Notes

- **Siblings:**
  - `shell-across-packages` builds the header and the theme's remembered
    setting this switch sits beside.
  - `theming-and-wording-reference` lists every wording key with its English
    and German text, the reference behind what this switch shows.
  - `one-search` finds keys by their German text.
- **Numbers this rests on:**
  - 288 wording keys, all present in both languages (the `Wording` type makes
    a missing German entry a compile error).
  - Four of five packages read core's language.
  - Seven examples in the workspace show German today.

**Acceptance:**
- [ ] Core, table, schedule and calculation show the EN/DE switch in the
      header; charts does not, and its Installation page says why.
- [ ] DE renders every example and scenario with German words and German
      notation; prose, tables, code, palette and shell stay English.
- [ ] The choice survives a reload and a move to another demo.
- [ ] Stages carry `lang="de"` under German; the address never changes.
- [ ] Shell suite and axe green; no baseline changed.

## Comments

Delivered on `main` on 4 Oct 2026: every ticket under `issues/` is `Status: done` and carries its own delivery report. The whole effort was checked once more on `main` afterwards — lint, typecheck, unit and the full visual suite green.
