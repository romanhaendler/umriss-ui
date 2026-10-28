# 12: DEV warns when a lowered build keeps a JavaScript dark mode light

**What to build:** A developer who sets dark mode from JavaScript in a build that lowered `light-dark()` (Vite 8 and Next 16 by default) learns it in development, with the one-line fix. In DEV, core detects once after mount that its tokens were lowered by the build (the lowering's own custom properties are present on the root) and that the page's computed `color-scheme` is dark while the tokens resolve to their light values; it warns once with the two fixes the README names (a `color-scheme` rule for the app's dark marker, or a modern CSS build target). Behaviour does not change (ADR-0021's amendment stands; it gets a dated note). Core's `llms-full.md` gains the dark-mode rule for lowered builds, which today only the README has. Spec: `../spec.md` ("Lowered light-dark() warning", "llms-full.md"); repros: `../personas/p4-jonas.md` 1, `../personas/p16-migration.md` 1.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A browser test on a production build without a CSS target, dark set from JavaScript: one warning naming both fixes (it may run the build in DEV mode if a production build drops the warning; say how)
- [ ] No warning with the CSS target set, with dark set in CSS, or in light mode
- [ ] `llms-full.md` of core states the rule where theming is explained
- [ ] ADR-0021 has a dated note on the warning
- [ ] Commit body: `Changelog core Added:` line
