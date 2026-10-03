# Spec: Theming and wording on the site — the tokens and the words as tables

Status: ready-for-agent

Origin: session of 2-3 Oct 2026. The brief, in the words it was given in: "Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art, sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen." Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes: landing_pages, component_api_reference, discoverability_interactivity, data_library_docs, asis_site_ux, asis_props_types). Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: ADR-0019 (the wording is a directory, German as a subpath), ADR-0021 (cascade layers, the library sets no `color-scheme`), ADR-0024, `docs/design-language.md` (Ink & Paper), `.scratch/demo-as-documentation/spec.md` (pages, examples as files).
Blocked by: nothing
ADR: ADR-0045 — Tokens are the styling API; data attributes are not.
Tickets: `issues/01`–`04`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

## Problem Statement

A developer who wants umriss to look like their product cannot see what they may change. The Installation page says "Every token is a `--u-…` custom property in the cascade layer `umriss.tokens`" — and lists none. Core declares 116 of them and the charts 29; 32 of core's and one of the charts' appear on the site, incidentally, inside example source. The list lives in a stylesheet in the repository. There is no page about theming at all: how dark mode works, how to override a colour for the whole application or for one region, what is safe to touch.

Nothing tells the developer what is *not* safe to touch either. About 110 `data-*` attributes sit in the components' markup (31 in core, 39 in the table, 21 in the schedule, 15 in the calculation, 4 in the charts). Seven appear on the site by accident. A developer who styles `[data-pin]` because it is the handle they found has no way of knowing that the next minor version may rename it.

The words are in the same state. The Language page says "Every wording is typed `Wording`" — a directory of 288 top-level entries, about 380 with the nested ones, that a developer must override entry by entry to adjust a single label. Not one key is listed. To change "No matches" a developer opens a 918-line source file. The charts' own directory, `ChartsWording` (52 entries), and the format directory are just as invisible. The German texts — the library's one feature that no compared library offers out of the box — are shown nowhere side by side with the English.

## Solution

Two tables, generated from the source, on two pages of core:

- A new page **Theming** in core: what the tokens are and how they cascade, three examples (the accent for the whole application, a token for one region, a dark region), and the **token table** — every token of core and of the charts, grouped as the stylesheet groups them, with its light and dark value side by side, a live colour swatch for colour tokens, and the comment the stylesheet carries for it. One sentence states the rule: style through tokens; `data-*` attributes and class names are internal.
- On the existing **Language** page: the **wording tables** — every entry of core's `Wording`, of the charts' `ChartsWording` and of the formats, with its English and its German text side by side and the comment the type carries for it.

Both tables are read from the source by the demo tooling at generation time, prerendered, carried in the llms text, and every row has an anchor that search (`one-search`) will find.

## User Stories

1. As a developer theming an application, I want a page called Theming, so that I find out where to start without searching.
2. As a developer, I want every token listed with its name, so that I know the whole surface I may change.
3. As a developer, I want each token's light and dark value side by side, so that I see what changes between the themes.
4. As a developer, I want a colour swatch drawn from the token itself, so that I see the colour, not a hex code.
5. As a developer, I want the swatch in the light column drawn in light and the one in the dark column drawn in dark regardless of the page's theme, so that I compare both at once.
6. As a developer, I want a token that refers to another token to show that reference as a link, so that I see which token to change at its root.
7. As a developer, I want the tokens grouped as the stylesheet groups them (neutral colours, edges, stacking order and the rest), so that I find related tokens together.
8. As a developer, I want a token's comment from the stylesheet next to it, so that I learn what it is for.
9. As a developer caring for reduced motion, I want the duration tokens marked "0 ms under reduced motion", so that I know the library already honours the preference.
10. As a developer using charts, I want the charts' `--uc-` tokens listed with the core token each falls back to, so that I know that theming core themes the charts.
11. As a developer, I want an example that changes the accent for the whole application, so that I can copy the one rule I need.
12. As a developer, I want an example that changes a token for one region only, so that I learn tokens cascade like any custom property.
13. As a developer, I want an example of a dark region on a light page, so that I learn the library follows `color-scheme` and sets it nowhere.
14. As a developer, I want the layer order explained in one paragraph, so that I know why my unlayered CSS wins.
15. As a developer, I want to be told plainly that `data-*` attributes and class names are not a styling API, so that I do not build on something that may change.
16. As a developer tuning a label, I want every wording entry listed with its key, so that I know what to override.
17. As a developer, I want the English and the German text of each entry side by side, so that I see both shipped languages at once.
18. As a developer writing a third language, I want the full list of entries with their English text, so that I can translate the directory completely.
19. As a developer, I want a parameterised entry to show its parameters and its sentence (`optionScopeSelected(count)` with its template), so that I know what my function receives.
20. As a developer, I want nested entries (`presets.today`) shown with their full path, so that I can write the override object.
21. As a developer, I want each entry's comment from the type, so that I learn where the text appears.
22. As a developer using charts in German, I want the charts' wording listed too, with the prop it goes into, so that I translate charts the same way.
23. As a developer, I want the format directory listed (number and date notation per language), so that I see what `GERMAN_FORMATS` changes.
24. As a developer, I want every token and every wording entry to have its own anchor, so that I can link to `--u-color-accent` or to `noMatches`.
25. As a search user, I want tokens and wording keys to be search targets, so that typing `--u-accent` or "No matches" finds them (taken up by `one-search`).
26. As a coding agent, I want both tables in `llms-full`, so that I write correct overrides without guessing names.
27. As a maintainer, I want the tables generated from the stylesheet and the wording source, so that a new token or entry appears without editing a page.
28. As a maintainer, I want the build to fail when a declared token or a wording entry is missing from its table, so that the guarantee holds.
29. As a reader on a phone, I want the long tables to scroll inside their frame, so that the page does not scroll sideways.
30. As a reader using a screen reader, I want each swatch to carry no meaning that the value text does not also carry, so that I lose nothing.

## Implementation Decisions

**What counts as a token.** A custom property is a token when it is *declared* (left-hand side of a declaration) in a shipped stylesheet and its name carries the package's token prefix in the scope where tokens live: in core, `--u-` declared on `:root` inside the `umriss.tokens` layer; in the charts, `--uc-` declared on the chart's root class. Custom properties a component module declares for itself are not tokens and are not listed. The existing vocabulary guard keeps its rule (no reference to a token that does not exist) and is unchanged.

**How tokens are read.** The demo tooling parses the two stylesheets with the CSS parser already in the workspace and produces, per token: name, group, light value, dark value, comment, whether it is overridden under reduced motion, and the token it falls back to or refers to. A value written `light-dark(a, b)` gives `a` and `b`; any other value stands in both columns, and the dark column then reads "same". A `var(--x, fallback)` reference renders as a link to `--x` (with the fallback kept as text). The group is the nearest preceding section comment of the form the stylesheet already uses (`/* ---- Name ---- */`); the comment is the one immediately before the declaration or after it on the same line. Section comments that are not English today ("Tinte & Papier") are translated in the stylesheet as part of this spec (ADR-0018).

**Swatches are drawn by the browser.** A colour token's swatch is an element whose background is the token itself; the light column's cell sets `color-scheme: light`, the dark column's `color-scheme: dark`. `light-dark()` then resolves on its own — no colour is parsed or converted at generation time. A token counts as a colour when its name contains `color` or its light value is a colour literal (hex, `rgb()`, `hsl()`, `oklch()`, a named colour) or refers to a colour token. Non-colour tokens show their value only. The swatch is decorative (`aria-hidden`); the value text carries the meaning.

**The Theming page.** Core, address `/core/theming/`, name "Theming", in the rubric `sidebar-tree` names "Customising" (until that lands, in Getting started after UmrissProvider). Lede: what a token is and that it is the styling API. About, at most three paragraphs: the cascade layers and why unlayered CSS wins; `light-dark()` and `color-scheme` (the library sets none); the rule of ADR-0045. Three examples, each a file like every example and held by the own-data check: "Accent for the application" (one unlayered rule on `:root`), "A token for one region" (a token set on a container), "A dark region" (`color-scheme: dark` on a container). Then the token table: core's groups, then a section "@umriss-ui/charts" with the `--uc-` tokens and the sentence that each falls back to the core token it names. The two paragraphs about tokens and light/dark on the Installation page shrink to one sentence with a link to Theming.

**Why core's page carries the charts' tokens.** The tokens are one system — every `--uc-` token falls back to a `--u-` token — and a developer theming an application themes both at once. The tooling reads the charts' stylesheet as a file at generation time; no demo imports another package's source for this. The charts' Installation page gains one sentence linking to the section.

**The wording tables.** On the Language page of core, after the examples and before the API section: three tables, "Wording" (core's `Wording`), "Charts wording" (`ChartsWording`, with the sentence that it goes into `Chart`'s `wording` prop and its German into `@umriss-ui/charts/wording/de`), "Formats". Columns: Key, English, German, Description. The tooling reads the interface for keys, order, groups and comments, and the default and German objects for the texts, through the TypeScript parser. A string entry shows its text. A function entry shows the key with its parameter names (`optionScopeSelected(count)`) and, as the text, the function's body as written (the template literal), in code. A nested object is flattened with dots (`presets.today`). Groups come from the section comments in the interface (`/* -------- Inputs ---- */`), each a sub-heading of the table. An entry with no comment shows "—" in Description; no gate demands one.

**Anchors.** Tokens at `#token-<name without the leading dashes>` (`#token-u-color-accent`); wording entries at `#wording-<key>` and `#charts-wording-<key>`, format entries at `#format-<key>`, dots kept.

**One writer for both outputs.** Both tables are produced as HTML and as Markdown by the tooling, in the same way `types-without-holes` writes the props tables: one model, two writers. The Markdown goes into `llms-full` as part of the page; the HTML is prerendered and mounted by the app.

**ADR-0045 — Tokens are the styling API; data attributes are not.** Context: headless libraries (Base UI, Radix) document data attributes because they have no other styling surface; umriss is a styled 0.x system whose 110 data attributes are implementation details. Decision: the `--u-` and `--uc-` tokens listed on the Theming page are the public styling API and change only with a changelog entry; `data-*` attributes and class names are internal and may change in any version. Consequences: the Theming page says so; a request to style something no token reaches is answered with a token, not with a documented attribute.

## Testing Decisions

A good test gives the reader a small stylesheet or wording source and states the rows that come out.

- **Token reader** (new cases in the demo tooling unit tests, against a fixture stylesheet): a `light-dark()` value splits; a single value stands in both; a `var()` reference with fallback yields a link target and keeps the fallback; a declaration outside `:root` or outside the tokens layer is not a token; a section comment becomes the group; a preceding and a trailing comment are both read; a redeclaration under reduced motion marks the token; a charts-style root-class declaration is read with its fallback token.
- **Wording reader** (against a fixture interface with default and German objects): a string entry, a function entry with its parameters and body, a nested entry flattened, a group from a section comment, an entry without a comment.
- **Built-site guard** (the pages build): the Theming page has an element with the anchor of every token the reader finds in the two real stylesheets, and the Language page has one for every key of the three directories — counted against the source, so a new token or entry without a row fails the build.
- **Page suite**: the Theming page's examples run and their code copies like every page's (existing checks apply by being examples).
- **Screenshot baselines**: the Theming page's head and its three examples join the core baselines; the swatch column is covered by one picture of the token table's first group in light and dark, because "the dark swatch is dark on a light page" is a promise only pixels hold.

Prior art: the stylesheet guards that read stylesheets as text, the props reader's fixture suite, the built-site guard, the screenshot suite.

## Out of Scope

- Documenting `data-*` attributes or class names (ADR-0045).
- A theme editor or a live token playground.
- Per-component CSS variable tables (`--u-drawer-width` and its like are tokens and stand in the one table).
- A "used by" column naming which component reads a token or a wording entry.
- A gate requiring a comment on every token or wording entry.
- The language switch for the demos — `language-switch`.
- Tokens of table, schedule and calculation: they declare none of their own; their stylesheets consume core's.

## Further Notes

Siblings: `sidebar-tree` (the Customising rubric and the place of Theming), `one-search` (indexes tokens and keys by the anchors set here), `api-index` (its entries for `DEFAULT_WORDING`, `GERMAN_WORDING` and the formats link to these tables), `language-switch` (the German column is the same text the switch shows).

Motivating numbers (build of `main` @ 3b2fa14): 145 tokens (core 116, charts 29), 33 of them on the site by accident; about 110 data attributes; 288 top-level wording keys (about 380 entries), 52 charts wording entries, none listed.

Acceptance:
- [ ] `/core/theming/` exists with three running examples and a table of all 145 tokens, light and dark side by side, swatches correct in both themes.
- [ ] The page states that `data-*` attributes and class names are not stable; ADR-0045 is written.
- [ ] The Language page lists every entry of `Wording`, `ChartsWording` and the formats with English and German.
- [ ] Every token and entry has its anchor; the build fails when one is missing.
- [ ] Both tables are in `llms-full`.
