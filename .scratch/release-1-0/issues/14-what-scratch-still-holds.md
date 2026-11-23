# What `.scratch` still holds

Type:   research
Status: resolved

## Question

`.scratch/` holds open work only, a folder is deleted when its last ticket is done - yet fifteen folders
stand beside this one. For each: what is in it, what of it is still open, and a proposal: **before 1.0**
(it is polishing by the map's Notes), **after 1.0** (a capability; say whether it could be added without a
break), or **delete** (done or overtaken; name what overtook it).

Name every open ticket by its title, and every unbuilt spec. The proposal is not the decision.

Findings: `.scratch/release-1-0/research/14-what-scratch-still-holds.md`

## Answer

Findings: `.scratch/release-1-0/research/14-what-scratch-still-holds.md`. "Built" was checked against each
package's `API.md`, `CHANGELOG.md` and `docs/adr/`. Proposals, not decisions.

- **Two tickets are open in all fifteen folders**, both only a person can close: "The hosted site is switched
  off" (`local-docs`; the Search Console removal is left) and "The settings only a person can make"
  (`security-hardening`; GitHub and npm settings and a watched release). Both before 1.0. Whether they were
  done since could not be checked.
- **Delete, done or overtaken**: `after-shakedown`, `alarm-management`, `demo-rework`, `shakedown`,
  `shakedown-2026-10-28`, `shakedown-2026-10-31`, `shakedown-defects`, `straighten-0-49`,
  `table-fills-its-frame`, `touch-scale-opt-in`, and the delivered parts of `open-points-roadmap`. Several
  are cited from `docs/` (ADR-0081, `docs/README.md`, `docs/agents/shakedown/`, two research reports): the
  pointers are set right first, and three reference matrices and one page study may move to `docs/research/`.
- **After 1.0, capabilities that can be added without a break**: the chart navigator (the one unbuilt spec),
  and the unbuilt rest of the roadmap's package C (horizontal bars, stacked overlap in the schedule, the
  utilisation line, a timeline, saved views, Sankey and bullet graph). "Line colour by limit" may already be
  covered by the limit's `color`.
- **Candidates it turned up**: no `SECURITY.md`; two undecided design notes in `straighten-0-49` (should the
  space tokens follow the root font size; group labels centred or at the start); the "kept by judgement" and
  "wishes not taken" lists of `shakedown-2026-10-31`.
