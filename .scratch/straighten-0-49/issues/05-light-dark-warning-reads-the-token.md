# 05: The lowered-build warning reads the token and follows the mode

**What to build:** A developer gets the lowered `light-dark()` warning exactly when it applies: the light value is read from the token itself (a probe forcing `color-scheme: light`), not from a copied colour; the check runs once after mount and once more when the root's `color-scheme` changes, then stops. A theme that overrides the background raises nothing. DEV only. Spec: `../spec.md` ("Lowered light-dark() warning").

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Component tests: a themed `--u-color-bg` under a JavaScript dark mode in an unlowered build stays silent; dark switched on after mount in a lowered build warns once; light, CSS-set dark and the modern target stay silent
- [ ] No colour literal of a token in the warning's code
- [ ] Silent and inert in production (existing gate)
- [ ] Commit body `Changelog core Fixed:` line
