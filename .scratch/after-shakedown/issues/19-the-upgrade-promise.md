# The upgrade promise: peer ranges, deprecation and support

Type:   grilling
Status: open

## Question

What does umriss promise someone who upgrades?

- Peer ranges: `^0.40.4` makes npm refuse a core one patch behind (`.scratch/shakedown/cross-package.md` 7).
  Peer `^0.x.0`, or always release in step and say so?
- A deprecation policy: how long a renamed prop, token or wording key keeps working, and how it warns
  (`audit-family.md` "Upgrade risk", `upgrade.md`). `docs/releasing.md` names `npm deprecate` only for a broken
  release.
- A support window and what a "Changed" section must carry (a migration line per change?).
- 1.0: roadmap G2 says not a goal now - does a policy change that?
- The minimum TypeScript version (`NoInfer` needs 5.4, stated nowhere: `cross-package.md` 12).

Costly to reverse once published: an ADR or a section in `docs/releasing.md`.
