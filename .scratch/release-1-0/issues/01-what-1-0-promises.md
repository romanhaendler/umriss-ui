# What 1.0 promises

Type:   grilling
Status: resolved

## Question

ADR-0066 ends with "1.0 stays no goal". 1.0.0 is to mean plain semver from then on (settled while charting).
What exactly does the new ADR promise?

- How long a renamed prop, export, wording key or token keeps working: until the next major, or a fixed span.
- How the packages name their umriss peers from 1.0 on, and whether they stay in step under one number.
- What happens to `0.x` after 1.0: fixes or none.
- What counts as a break: a token's value, a default, the DOM and class names, a wording text, the look.
- The floors (React 19, TypeScript 5.4): is raising one a major?

The answer is the ADR's decision paragraph, and which parts of ADR-0066 it supersedes.

## Answer

Written as `docs/adr/0083-from-1-0-a-break-costs-a-major.md`, which supersedes ADR-0066 from `1.0.0` on;
until then ADR-0066 holds unchanged. The maintainer answered eleven questions (2026-11-23):

- Semver from `1.0.0`; the seven packages stay in step under one number, in a major too.
- The surface is what is written down: every entry of `API.md` with type and default, the token names, the
  wording keys. Not the DOM, class names, development warnings or the default wording's texts.
- A token's value may change in a minor; the measures a layout hangs on (row height, control heights, the
  space scale) only in a major.
- A stricter type is a fix where it refuses only code that was wrong at run time.
- A rename lives until the next major; no cadence of majors is promised.
- `@experimental` is exempt and listed apart in `API.md`; what `1.0.0` marks is decided per package.
- `0.x` ends with `1.0.0`; a fix goes into the latest minor only.
- Raising React is a major, React is peered `^19`; raising TypeScript (5.4), Node (22, new in `engines`) or a
  browser floor is a minor that says so.
- *(agent)* Peers are written `^1.x.0`. "Changed" with a migration line stands in a major only.

Polishing points this makes, all before 1.0 *(agent)*: `engines` in the seven manifests; React peered `^19`;
`check:dist` taught the peer form, the deprecation marker and the changelog sections of `1.x`; `API.md`
listing `@experimental` apart; the design language naming the tokens that are measures; the documents that
cite ADR-0066 set right with the release. The rename mechanism of ADR-0066 stays, so `warnDeprecated*` in
core's `lib/dev.ts` is not dead code to delete.
