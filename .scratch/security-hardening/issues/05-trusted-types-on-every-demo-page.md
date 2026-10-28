# 05 - Every demo page runs under Trusted Types

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/security-hardening/spec.md` (Implementation Decisions, "Trusted Types")

## What to build

Every page of every demo is opened under
`require-trusted-types-for 'script'; trusted-types umriss-demo`, and a check
fails on any violation, so any HTML sink in library code turns a test red. The
demo shell's own HTML (highlighted example source, API index, API and
reference tables) goes through the one policy `umriss-demo`. Application
developers read that umriss runs under Trusted Types.

## Acceptance criteria

- [ ] The demo shell creates exactly one Trusted Types policy, `umriss-demo`, and passes all HTML it sets through it; where Trusted Types do not exist (other browsers, jsdom) the helper returns the string.
- [ ] A shared check `checkTrustedTypes({ open, pages })` stands beside `checkSilentPages` in the demo shell's checks. It serves the demo document with the CSP header by intercepting the document request (the demos' Vite configs and the dev server stay unchanged), opens each page, and fails on any `securitypolicyviolation` event or any console error naming Trusted Types; the message names the page, the directive and the sample.
- [ ] Each of the seven packages has a `trusted-types.spec.ts` calling the check with all its pages, tagged `@quick`, Chromium only.
- [ ] Shown to fail once: a temporary `innerHTML` assignment in one library component makes the check red (not committed).
- [ ] `pnpm test:visual:quick <package>` passes for all seven packages.
- [ ] One sentence where each package's README states what it installs (next to ADR-0073's claim): umriss writes no HTML into the document and runs under `require-trusted-types-for 'script'`. `pnpm check:site` passes.
