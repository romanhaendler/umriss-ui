# 01: Toasts that stay are never pushed out

**What to build:** A toast with `duration: 0` and a `loading` toast never give way to newer toasts and do not count toward the limit. The limit still caps the toasts that leave by themselves: with the default of 3, up to three timed toasts stand, plus every lasting and every loading one. A failure like "Profile not saved" stays until it is closed, however many confirmations arrive after it; a `loading` toast stays until `update` turns it into its outcome.

**Blocked by:** None (can start immediately)

**Status:** done

Spec: `.scratch/toasts-one-deck/spec.md` (Implementation Decisions "The limit", User Stories 12–18, 21)

- [x] A toast *may give way* when its effective duration (its own, else the provider's) is above 0 and its tone is not `loading`; only such standing toasts are counted against the limit and pushed out, oldest first, with `dismiss`
- [x] The limit is applied on arrival only; `update` pushes nothing out, a `loading` toast turned into its outcome counts from the next arrival on
- [x] The same rule during a hold: a lasting toast among the arrivals comes back
- [x] Unit tests in the limit tests of the toast: `duration: 0` plus four timed (stays, oldest timed goes); `loading` plus four timed (stays, `update` then shows the outcome); `loading` turned `success` gives way at the next arrival beyond the limit; provider default `duration: 0` (none gives way); hold with a lasting toast among four arrivals
- [x] The existing limit tests stay green
- [x] The texts of `update` and of `ToastConfig.limit` say the new rule; `CONTEXT.md` **Toast**: the oldest that leaves by itself gives way
- [x] `CHANGELOG.md` of core, under **Changed**: lasting and `loading` toasts no longer give way to the limit
- [x] `pnpm check core` green
- [x] One commit, no push

## Comments

Built in `ToastProvider.toast` (only toasts with effective duration above 0 and tone other than `loading` are counted and pushed out); texts of `update`, `ToastConfig.limit`, API.md, CONTEXT.md and the changelog (new "Unreleased" heading) say the rule. Deviation: the existing hold test "keeps the limit" used `duration: 0` toasts as its timed ones; they are timed now, as the rule requires.
