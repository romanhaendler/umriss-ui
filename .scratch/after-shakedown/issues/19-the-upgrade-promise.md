# The upgrade promise: peer ranges, deprecation and support

Type:   grilling
Status: resolved

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

## Answer

Decided 2026-10-25 by the maintainer; the mechanics are marked *(agent)*.

- **The packages always release in step**, one version for all six, and say so in `docs/releasing.md`.
- **Peer ranges cover the minor line:** a package of `0.x.y` names its umriss peers as `^0.x.0`, so a peer one
  patch behind is accepted *(agent: the exact range form)*.
- **Deprecation:** a renamed prop, token or wording key keeps working under its old name for one further minor
  release and warns once in DEV; the release after that removes it. Every entry under "Changed" carries a
  migration line.
- **Support:** fixes go into the latest minor only. 1.0 stays no goal (roadmap G2); this policy does not change
  that.
- **TypeScript 5.4 is the stated floor** (the declarations use `NoInfer`), named in every README.
- **ADR:** costly to reverse once published, so one ADR "The upgrade promise", written as the spec's first
  ticket; `docs/releasing.md` points at it.
- **Becomes** the spec `.scratch/upgrade-promise/`.
