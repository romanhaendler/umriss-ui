# 06: Breadcrumb's folded menu follows only safe links

Spec: `.scratch/shakedown-defects/spec.md` (Core: Breadcrumb)
Finding: `security.md` 1

**What to build:** an entry in Breadcrumb's folded "…" menu resolves its href
against the document and follows it only for `http:`, `https:`, `mailto:`
and `tel:` - relative and fragment hrefs resolve to one of these. Any other
scheme (`javascript:`, `data:`, `vbscript:`) makes the entry do nothing.
`onSelect` keeps precedence over the href.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Red first (core's breadcrumb test, `location.assign` stubbed): a folded `javascript:` entry does not navigate
- [ ] `data:` and `vbscript:` do nothing; relative, fragment, `https:`, `mailto:`, `tel:` navigate; `onSelect` is called whatever the href
- [ ] The inline links stay plain `<a>` elements
- [ ] `pnpm check core` green
- [ ] Finding 1 struck from `.scratch/shakedown/security.md`
