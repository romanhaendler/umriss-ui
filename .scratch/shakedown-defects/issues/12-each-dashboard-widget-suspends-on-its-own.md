# 12: Each dashboard widget suspends on its own

Spec: `.scratch/shakedown-defects/spec.md` (Dashboard: Suspense)
Finding: `dashboard.md` 1

**What to build:** a widget whose content suspends (`React.lazy`, `use()`, a
Suspense data library) shows core's `Skeleton` in its own body while the
other widgets stay visible. Each widget's content stands in its own
`Suspense` inside the existing error boundary; a throwing widget keeps its
fallback. No new wording.

**Blocked by:** 11 (same dashboard module)

**Status:** ready-for-agent

- [ ] Red first (a Dashboard render test): a lazy widget beside a plain one - the plain widget renders while the lazy one is pending
- [ ] The pending widget shows a Skeleton at its size; it shows its content once resolved
- [ ] A throwing widget still shows the failed sentence
- [ ] `pnpm check dashboard` green
- [ ] Finding 1 struck from `.scratch/shakedown/dashboard.md`
