# From the documentation research to work

Status: done
Date:   2026-10-03
Origin: session of 2–3 Oct 2026. The brief, in the words it was given in:
"Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. Die Startseite ist zwar
funktional, aber nicht gerade einladend. Bei den Komponenten habe ich das Gefühl,
dass nicht alle Parameter jeweils erklärt sind mit Beispielen. Auch sind nicht
alle Typen sauber angegeben und definiert. […] State of the Art, sehr einladend,
alles entdecken und benutzen zu wollen. Keine offenen Fragen." A follow-up asked
to rethink the menu tree explicitly ("Ist es in Core z. B. richtig, Sizes mit
konkreten Inputs zu mischen?"). The research and the gap analysis are in
`docs/research/component-docs-2026-10/`: four notes on the state of the art
(front pages, component pages and API reference, discoverability, data-heavy
libraries) and two inventories of the site as it stood on `main` @ `3b2fa14`.

The verdict: umriss-ui is stronger inside than outside. The scenarios, the page
anatomy, the props tables with a described prop in every row (810 of 810, gated
in CI) and the prerendered site are ahead of most libraries. What leads a visitor
to them is nearly empty: a front page of ~130 links and no picture, no way from
one package's demo to another's, 19 % of the props typed with a library type that
is defined nowhere on the site, 13 % of the props with a default shown, no
signature for 16 hooks and 91 functions, no list of 145 tokens or 288 wording
keys. So the work makes visible what already exists before it adds anything —
and then takes the one place no studied library holds: every prop linked to the
examples that show it, with the build failing when a prop is shown nowhere.

## The specs, in order

The order within a priority is the recommended order of delivery. `Blocked by`
in each spec is binding; the order here is only advice.

| Order | Spec | Priority | Blocked by | Why here |
| --- | --- | --- | --- | --- |
| 1 | `facade-defects` | P0 | — | What a first visitor sees broken in the first thirty seconds |
| 1 | `shell-across-packages` | P0 | — | Five demos become one site: switcher, wordmark, shared theme, title |
| 1 | `types-without-holes` | P0 | — | Wrong and missing type information; everything about props builds on it |
| 1 | `sidebar-tree` | P1 | — | The menu tree re-cut; owns every address change |
| 2 | `site-front-page` | P0 | `shell-across-packages` | The front page becomes an invitation |
| 3 | `page-orientation` | P1 | `shell-across-packages` | On-this-page contents, previous/next, a drawer on the phone |
| 3 | `props-to-examples` | P1 | `types-without-holes` | Every prop linked to its examples; the coverage gate |
| 3 | `api-index` | P1 | `types-without-holes` | Every export has a place on the site |
| 3 | `theming-and-wording-reference` | P1 | — | Tokens and wording keys, listed and searchable |
| 3 | `props-table-hygiene` | P1 | `types-without-holes` | No internal ids in user text; grouped props; a stricter gate |
| 3 | `pages-as-markdown` | P1 | — | A Markdown twin per page and a Copy page menu |
| 3 | `language-switch` | P1 | `shell-across-packages` | English and German at the press of a switch |
| 4 | `one-search` | P1 | `props-to-examples`, `api-index`, `theming-and-wording-reference` | One search across all five packages, everything findable |
| 5 | `concepts-and-changelog-pages` | P2 | `shell-across-packages` | The design language, the standards, the non-goals and the changelogs on the site |
| 5 | `configurator` | P2 | `types-without-holes` | Knobs for ten simple core components |
| 5 | `a11y-and-finish` | P2 | `types-without-holes` (type items only) | Accessibility notes, keyboard tables, the finishing items |

## What stays as it was decided

- **No documentation website beside the demos** (`docs/README.md`, ADR-0037).
  The front page and rendering the workspace's own documents are part of the one
  site, not a second one; `concepts-and-changelog-pages` records that as an ADR.
- **No component gallery as a package landing.** The scenarios do that job. The
  front page gets five package tiles with a preview each — five pictures, not 133.
- **No tabs on a page, code collapsed, no TS/JS switch, no sandbox.**
- **No Pagefind and no MCP server for now.** The search uses the library's own
  `CommandPalette` over an index the build already has the data for; a Markdown
  twin per page makes the MCP threshold of `ai-readable-docs` moot.

## What is overturned

- *Hooks and library modules get no page* (`demo-as-documentation`): overturned
  by `api-index`, machine-generated only (ADR-0044).
- *umriss has no public styling API per component*: half overturned by
  `theming-and-wording-reference` — the tokens are the styling API, the data
  attributes are not (ADR-0045).
- *Sizes is a form control* (the current core outline): overturned by
  `sidebar-tree`.

## Comments

Delivered on `main` on 4 Oct 2026: every ticket under `issues/` is `Status: done` and carries its own delivery report. The whole effort was checked once more on `main` afterwards — lint, typecheck, unit and the full visual suite green.
