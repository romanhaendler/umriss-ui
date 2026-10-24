# 04: ToastProvider renders on the server

Spec: `.scratch/shakedown-defects/spec.md` (Core: server render)
Finding: `core.md` A4

**What to build:** `ToastProvider` in a Next.js root layout passes
`next build`, and its server HTML hydrates without a warning. Telling a dialog
apart reads the element's node name, never the `HTMLDialogElement` global,
both for the toast region's target and for the hold's drawn-target test.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Red first: a Node-environment test renders `ToastProvider` with a child to a string without throwing (prior art: charts' and table's server-render tests)
- [ ] No render-time read of a DOM global remains in the toast code
- [ ] The existing toast tests (dialog move, hold, glide) stay green
- [ ] `pnpm check core` green
- [ ] A4 struck from `.scratch/shakedown/core.md`
