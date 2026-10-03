# 02: The header connects the five packages

Status: ready-for-agent
Blocked by: 01 (One list of packages, one theme for the whole site)
Spec: `.scratch/shell-across-packages/spec.md`

**What to build:** The same header on every page of every demo: the wordmark "umriss-ui" linking to the site root; a `nav` named "Packages" with five links (Core, Charts, Table, Schedule, Calculation), the current one with `aria-current="page"` and its version; the search; the theme switch; icon links "Source on GitHub", "`@umriss-ui/<package>` on npm" and "`llms.txt` for coding agents". The shell takes the package id instead of a `brand` and reads everything else from the package list. At 900 px and less the header takes two lines (wordmark, search, theme; then the package links, scrolling within themselves), and GitHub, npm and `llms.txt` move to the foot of the sidebar. The page never scrolls sideways.

- [ ] The shell suite, in every demo: the wordmark links the site root; five package links, the current one with `aria-current`.
- [ ] From every page of every demo, every other package and the front page are one click away.
- [ ] At 390 px all five package links are reachable and the page has no horizontal overflow.
- [ ] The axe run of the shell suite passes with the new header.
- [ ] The `brand` prop is gone; each App hands the shell only its demo and landing sentence.
- [ ] The screenshot baselines that show the header are renewed together.
