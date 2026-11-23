# Accessibility and browsers: claimed and checked

Type:   research
Status: open

## Question

What does umriss claim today about accessibility and browsers, and what checks each claim?

- Every statement in READMEs, docs and ADRs about keyboard use, screen readers, contrast, reduced motion,
  touch, and supported browsers.
- What the test suites check of it: axe or similar, keyboard tests, which Playwright projects run where
  (`docs/testing.md`, the Playwright configs, `.github/workflows/`). Firefox is said not to start in agent
  sandboxes: does CI run it?
- Claims nothing checks, and checks no claim names.

Facts only; the decision is "The acceptance criteria".

Findings: `.scratch/release-1-0/research/12-accessibility-and-browsers-claimed-and-checked.md`
