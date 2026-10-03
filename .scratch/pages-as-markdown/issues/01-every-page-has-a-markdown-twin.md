# 01: Every page has a Markdown twin

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/pages-as-markdown/spec.md`

**What to build:** The text generator keeps each page's Markdown cut beside the HTML it already derives from it, and writes it as the page's twin: `/<pkg>/<page>.md`, and `/<pkg>/index.md` for the scenarios page. The twin is the cut with headings lifted so the page name is `#`, a header blockquote with package, version, the HTML address and links to `llms.txt` and `llms-full.txt`, all links absolute, and without the crawler's "every page" list. The pages build copies the twins into the site; every prerendered page carries one `rel="alternate" type="text/markdown"` link to its twin; each package's `llms.txt` and the site-wide one link twins instead of HTML pages. `llms-full.txt` and the npm package's text are unchanged. A note under the Comments of `ai-readable-docs` records that its MCP threshold is superseded, and the `docs/README.md` row on coding agents names the twins.

- [ ] Fixture tests: each fixture page's twin equals its cut after the lift, has the header, absolute links and no "every page" list; the fixture `llms.txt` links `.md` addresses
- [ ] Built-site guard: every sitemap address has a non-empty twin starting with `# <page name>`; every HTML head has exactly one alternate link to an existing file; every link in every `llms.txt` resolves to a file in the site
- [ ] `llms-full.txt` and `docs/llms-full.md` are byte-identical to before for every package
- [ ] The MCP note is under the Comments of `ai-readable-docs`, and `docs/README.md` names the twins
