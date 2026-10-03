# 03: The Theming page explains the styling API (ADR-0045)

Status: ready-for-agent
Blocked by: 01 (A Theming page with core's token table)
Spec: `.scratch/theming-and-wording-reference/spec.md`

**What to build:** The Theming page gets its lede (a token is the styling API), up to three paragraphs (cascade layers and why unlayered CSS wins; `light-dark()` and `color-scheme`; the rule that `data-*` attributes and class names are internal), and three examples as files like every example: "Accent for the application", "A token for one region", "A dark region". The two paragraphs about tokens and light/dark on core's Installation page shrink to one sentence linking to Theming. ADR-0045 "Tokens are the styling API; data attributes are not" is written.

- [ ] The three examples run and copy, and pass the own-data check.
- [ ] The page states that `data-*` attributes and class names are not stable.
- [ ] The Theming page head and the three examples join the core screenshot baselines.
- [ ] ADR-0045 is in the ADR directory and its index.
