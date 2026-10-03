# 01: Every page has a Markdown twin

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/pages-as-markdown/spec.md`

**What to build:** The text generator keeps each page's Markdown cut beside the HTML it already derives from it, and writes it as the page's twin: `/<pkg>/<page>.md`, and `/<pkg>/index.md` for the scenarios page. The twin is the cut with headings lifted so the page name is `#`, a header blockquote with package, version, the HTML address and links to `llms.txt` and `llms-full.txt`, all links absolute, and without the crawler's "every page" list. The pages build copies the twins into the site; every prerendered page carries one `rel="alternate" type="text/markdown"` link to its twin; each package's `llms.txt` and the site-wide one link twins instead of HTML pages. `llms-full.txt` and the npm package's text are unchanged. A note under the Comments of `ai-readable-docs` records that its MCP threshold is superseded, and the `docs/README.md` row on coding agents names the twins.

- [x] Fixture tests: each fixture page's twin equals its cut after the lift, has the header, absolute links and no "every page" list; the fixture `llms.txt` links `.md` addresses
- [x] Built-site guard: every sitemap address has a non-empty twin starting with `# <page name>`; every HTML head has exactly one alternate link to an existing file; every link in every `llms.txt` resolves to a file in the site
- [x] `llms-full.txt` and `docs/llms-full.md` are byte-identical to before for every package
- [x] The MCP note is under the Comments of `ai-readable-docs`, and `docs/README.md` names the twins

## Comments

### Delivery report (2026-10-03)

- **Built.** `twinOfPlace` in `outline.ts` is the one place that knows the
  twin's address (`/select.md`, `/index.md`). `renderLlms` returns `twins`
  beside the site pages, and every `SitePage` names its `twin`. A twin is the
  page's cut of the full text, lifted through marked's lexer (so a `#` line in
  a source stays as it is), with a header blockquote under the name (package,
  version, the demo page, `llms.txt`, `llms-full.txt`), `#/page` links made
  absolute and no "every page" list. `generateLlms` writes them anew to
  `demo/.generated/twins/`; `build-pages.mjs` copies them beside the HTML and
  puts one `<link rel="alternate" type="text/markdown">` (by path, like the
  forwarder) into every prerendered head. Each package's `llms.txt` links the
  twins, and its scenario lines link `index.md`. The site-wide `llms.txt` links
  no HTML page, so it is unchanged. The guard is `twinFaults` in
  `tooling/site.ts` and runs beside `siteFaults`. The site-wide `llms.txt` is
  now written before the guard, so that its links are checked too.
- **Tests.** `llms.test.ts` (the twins against the fixture, and `llms.txt`
  links), `site.test.ts` (`twinFaults`: a missing, empty or misnamed twin; 0,
  2 or a wrong alternate link; an `llms.txt` link to no file), and
  `examples.test.ts` (`twinOfPlace`). `pnpm build:pages` passes the guard with
  138 twins for 138 pages: the hub has none and the one forwarder has none.
  `llms-full.txt` and `docs/llms-full.md` were compared byte for byte with a
  generation from before the change, and all five are identical.
- **Baselines.** None moved; no browser suite reads what changed.
- **Deviations.** The scenarios page's twin begins with `# <package name>`,
  as its prerendered `h1` and its `SitePage.name` do. The package's
  description and install line stand above the scenarios' cut (that is the
  front page's text without its page lists), so the guard's rule "begins with
  `# <page name>`" holds for every page alike. No CHANGELOG entry: nothing a
  package's caller installs changes. The two `#/page` links inside page
  sentences in core's `llms.txt` stay relative, because the line's text stays
  as it is; the guard resolves them to the file itself.
