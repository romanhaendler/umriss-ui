# 01: The `@quick` checks run in three engines, in CI

**What to build:** the `@quick` layout checks of all seven demos run in Chromium, Firefox and WebKit: as
Playwright projects chosen by an environment switch, and as a job in `ci.yml` on every push. The documents
say what runs where and how the engines are installed. See the spec's "Projects", "CI" and "A check that
fails in one engine"; findings `.scratch/release-1-0/research/12-accessibility-and-browsers-claimed-and-checked.md`
and `.scratch/release-1-0/research/10-the-documents-agree-with-the-source.md` section C.

You may run Playwright for this ticket, against the brief's general rule: only `@quick`, one demo at a time,
Chromium and WebKit (Firefox does not start in this sandbox; do not install it here, the coordinator runs it
in a container). Free the preview ports when you are done.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Size:** M (Sonnet)

- [ ] `pnpm test:visual:quick <pkg>` still runs Chromium only; the switch adds Firefox and WebKit
- [ ] Every `@quick` test of the seven demos is green in WebKit locally, or listed in the report with its
      reason and what was done
- [ ] `ci.yml` has the job; `docs/testing.md`, `docs/releasing.md`, `CONTRIBUTING.md` and `visual.yml`'s
      header say what runs where
- [ ] `pnpm check demo` and `pnpm typecheck` are green
