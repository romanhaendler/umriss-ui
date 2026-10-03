# 02: The charts' tokens on the Theming page

Status: ready-for-agent
Blocked by: 01 (A Theming page with core's token table)
Spec: `.scratch/theming-and-wording-reference/spec.md`

**What to build:** Below core's groups, a section "@umriss-ui/charts" lists every `--uc-` token declared on the chart's root class, with the sentence that each falls back to the core token it names (linked). The tooling reads the charts stylesheet as a file; no demo imports charts' source. The charts' Installation page gains one sentence linking to the section.

- [ ] Token reader fixture: a charts-style root-class declaration is read with its fallback token.
- [ ] All 29 charts tokens have rows and anchors; the built-site guard counts them against the stylesheet.
- [ ] The charts' Installation page links to the section.
