# After the shakedown

Label: wayfinder:map
Date:  2026-10-25

## Destination

For every topic the shakedown of 2026-10-24 left open - step 3 of `.scratch/shakedown/README.md`, the eight
alarm-management decisions (`.scratch/alarm-management/requirements.md`, part B) and every wish in
`.scratch/shakedown/wishes.md` - a recorded decision (take / later / never, the reason, ADR or not) or a spec
outline that `/to-spec` and then `/to-tickets` can take without asking the maintainer again.

## Notes

- **One ticket per session.** A grilling ticket calls the skills `grilling` and `domain-modeling`; the
  maintainer answers, the agent never answers for them. Research tickets run AFK in a subagent with the skill
  `research`; findings go on a local `research/<name>` branch (never pushed: only `main` goes to GitHub) and
  the ticket points at the file.
- **Read before claiming absence:** `packages/<pkg>/API.md`, `CONTEXT.md`, `docs/adr/`. The shakedown file
  each ticket names holds the three proofs per wish (task, workaround with lines, where it exists elsewhere).
- **The answer is shaped for `/to-spec`:** what is decided, what is explicitly out, whether it is costly to
  reverse (then an ADR), which package(s) it touches, and which spec it becomes (new folder or an existing one).
- **Not argued again here:** the decisions of `.scratch/open-points-roadmap/spec.md` (G1: the maintainer is
  the caller - "waits for a caller" parks nothing), ADR-0045 (a styling wish is answered with a token),
  ADR-0059 (the set of chart kinds is open, by its test), ADR-0062 (React 19 floor). A ticket may reopen an
  ADR only where the shakedown showed its *Instead* failing.
- **Already specified, so only pointed at:** XLSX (`.scratch/table-xlsx/`), a chart's range and "a chart
  filters a table" (`.scratch/chart-range-selection-and-navigator/`), server mode's late answer, select all,
  export and sums (`.scratch/table-server-mode-2/`), the navigator (`.scratch/chart-navigator/`), and the
  roadmap's package C (print stylesheet, avatar, timeline, saved views, horizontal bars, ...). A wish they
  cover is answered by naming the spec.
- **Already decided, straight to `/to-spec`:** the three styling needs no token reaches - a modal width, the
  eyebrows' text-transform, the button's press scale (`design-system.md` 9) - get tokens, by ADR-0045.

## Decisions so far

<!-- one line per resolved ticket: [title](issues/NN-slug.md): gist -->

- [ISA-18.2 and EEMUA 191 in secondary sources](issues/08-isa-18-2-and-eemua-191-in-secondary-sources.md): the
  states, shelving and acknowledgement hold; the second field is OPC UA's, the flood threshold ISA's, the
  silent level "diagnostic"; a narrow wording without conformance is proposed.

- [What a package ships so that Jest and Vitest load it unconfigured](issues/01-what-a-package-ships-for-jest-and-vitest.md):
  only a CJS entry without a CSS import from JS loads unconfigured in both; ADR-0021's "Vitest handles CSS
  imports" does not hold.

- [Server Components in comparable libraries](issues/03-server-components-in-comparable-libraries.md): per-module
  `"use client"`, field-name config and a data tree instead of element-type matching are what others do; dates
  either show the server's zone or need a browser-only pass.

## Not yet specified

- **Time zones.** ADR-0060 says "not yet; umriss shows the reader's time". Server rendering (hydration
  error #418 under a UTC server, `cross-package.md` 5) and the plant-time-zone wishes of charts and schedule
  press on it. Sharp once "What umriss promises a Server Component" is answered.
- **What the four triage tickets take on.** A wish taken there may need a decision of its own (an API shape,
  an ADR); each graduates into a ticket of this map, or goes straight to `/to-spec` if nothing is left to
  decide.
- **The order of the work.** Once the decisions stand, one page that orders the resulting specs into
  releasable packages, as `.scratch/open-points-roadmap/spec.md` did for October - after that roadmap's
  packages B and C, or interleaved with them.

## Out of scope

- The shakedown's findings that are neither a step-3 item nor a wish - the unconfirmed misfits and looks in
  `accessibility.md`, `zoom.md`, `qa.md`, `upgrade.md`, `agent-docs.md` and the per-package files. They are
  defects or polish, not decisions: a triage of their own, as step 2 was.
- Building anything. This map ends at decisions and spec outlines.
