# From 1.0 a break costs a major

Status: accepted, supersedes ADR-0066 from `1.0.0` on
Date:   2026-11

ADR-0066 gave `0.x` an upgrade promise and ended with "1.0 stays no goal": the
surface still moved. Since then the root contract and the field contract of
ADR-0081 have landed, no deprecated alias is alive in core or the table, and what
is still named inconsistently is set right before `1.0.0`. After that `0.x` would
tell a caller the opposite of what is meant: under it every minor may break, and
a rename lives one minor only because minors come weekly.

`1.0.0` is therefore a promise and not a number. Until it appears, ADR-0066
holds unchanged.

## Decision

**From `1.0.0` the seven packages follow semver: a break appears only in a major,
and the seven stay in step under one number, in a major too. The surface the
promise covers is what is written down - every entry of a package's `API.md` with
its type and default, the token names and the wording keys. A renamed prop,
export, wording key or token keeps working under its old name, with a warning in
development, until the next major. What is marked `@experimental` is exempt.
`0.x` ends with `1.0.0`, and a fix is released for the latest minor only. Raising
the React floor is a major; raising the floor of TypeScript, Node or a browser is
a minor that says so.**

## What follows

- **The surface.** `API.md` is the list: exports, props, options, returns, their
  types and defaults. Beside it the names of the tokens and the keys of the
  wording. Not covered: the DOM a component renders, class names, the warnings of
  development, and the texts of the default wording. A caller who styles reaches
  for a token (ADR-0045), not for the DOM.
- **The look.** A token's value may change in a minor. The measures a layout
  hangs on - the height of a row, the heights of the controls, the space scale -
  change only in a major. The design language names the tokens that are such
  measures.
- **Types.** A stricter type is a fix where it refuses only code that was wrong at
  run time. Any other narrowing is a break.
- **A rename.** The mechanism of ADR-0066 stays: the old name carries
  `@deprecated since <version> - use <new>.`, is listed last, and warns once in
  development. What changes is the end: the next major removes it, not the next
  minor. How often a major comes is not promised.
- **`@experimental`.** A marked export, prop or option may change in a minor.
  `API.md` lists what is marked apart from the rest. What `1.0.0` itself marks is
  decided per package.
- **In step.** A break in one package raises all seven to the next major. The
  changelog of a package without a break says that nothing changes for its
  callers.
- **Peers.** A package of `1.x.y` names its umriss peers as `^1.x.0`: a newer
  core always fits, an older one never, because a minor may read something new
  from core. React is peered as `^19`; a further React major is admitted in a
  minor once it is checked.
- **The changelog.** "Changed" with its migration line stands in a major only. A
  minor has what was added, what was deprecated and what was fixed. `check:dist`
  holds this, the peer form and the deprecation markers.
- **Floors.** TypeScript 5.4 and Node 22 (`engines`) are written into every
  manifest and README, beside the browsers the READMEs name.
- **Support.** No fix for `0.x` after `1.0.0`. In `1.x`, as before, a fix goes
  into the latest minor; the packages are published from `main` alone.

## Considered Options

- **Staying at `0.x`.** Rejected: the number would go on saying that every minor
  may break, long after that stopped being the intent.
- **A rename that lives a fixed number of minors.** Rejected: that is a break in
  a minor under another name. The price is that aliases gather until a major.
- **Numbers per package.** Rejected as in ADR-0066: it brings back the table of
  which version fits which.
- **The look as surface.** Rejected: a colour or a radius must stay maintainable.
  The measures are excepted because a changed row height moves every page of a
  data-dense application.
- **No `@experimental`.** Rejected: every addition after 1.0 would have to be
  right at its first release, or cost a major.
- **React `>=19` without an upper bound.** Rejected: it promises versions nobody
  has run. Widening costs nothing later, narrowing costs a major.
- **A floor raised only in a major.** Rejected for TypeScript, Node and the
  browsers: none of them follows semver towards its users, and the library would
  be tied to versions their makers no longer support.

## Consequences

- An alias lives as long as its major. The code carries them until then.
- A break in the youngest package is a major for a caller who uses core alone.
- A caller on `0.x` gets a fix only by moving to `1.x`, with the guide from `0.x`.
- `check:dist`, `docs/releasing.md`, `CONTRIBUTING.md`, the READMEs and the
  changelogs' headers speak of `0.x` and are set right with the release of
  `1.0.0`.
