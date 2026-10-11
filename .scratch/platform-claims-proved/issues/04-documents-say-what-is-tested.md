# 04 - The READMEs, changelogs and testing guide say what is now tested

Status: done
Type: task
Size: S

Blocked by: 01, 02, 03
Spec: `.scratch/platform-claims-proved/spec.md` - P10

## What to build

- Each of the five READMEs: the sentence "React 18 or 19 as a peer" becomes the
  same sentence plus "the unit tests run against 18.3 and 19 in CI". After it,
  one paragraph under the install line, the same in all five: every entry,
  `./wording/de` included where there is one, begins with `"use client"`, so the
  components can be imported from a file of a Next.js application's App Router
  and are rendered on a server and hydrated on the client; the package is rendered
  to a string in a test. Core's paragraph also names the field widths that a server
  writes into the markup. Nothing else: no Next version, no promise about
  Server Components rendering anything, no other framework.
- Each package's `CHANGELOG.md`, under the heading the next release will use: an
  "Added" line for the directive, and a line under **"Changed"** of its own
  (the rule at the head of the file): every export is now a client component, so
  a hook called in a Server Component fails with React's message about a client
  reference instead of one about `useState`.
- `docs/testing.md`: the row of what CI runs gains the React 18 job and
  `check:dist`; the sentence on `forwardRef` points at the job.
- The header comment of `.github/workflows/ci.yml`: the list of what is checked.

## Acceptance

- [ ] Each sentence about React or the server matches a test or a check that
      exists; the ticket lists the pairing under `## Comments`.
- [ ] `docs/journal.md` is not touched (the maintainer's).

## Comments

- Delivered. Pairing of claim and proof:
  - "the unit tests run against 18.3 and 19 in CI" (five READMEs) - job `unit-react18` and `check` in `.github/workflows/ci.yml`, run locally under both (ticket 01); the job needs the fix named there before it proves it.
  - "every entry (`./wording/de` included in core and charts) begins with `"use client"`" - `scripts/check-dist.ts`, run by `pnpm -r check:dist` in `check` (ticket 03).
  - "rendered to a string in a test" - `tests-unit/ssr.test.tsx` in charts, table, schedule and calculation; for core the fields' widths in `fieldWidth.test.tsx` (not in the node environment).
  - The schedule's sentence: labelled frame and empty canvases on a server, lanes after mount - `packages/schedule/tests-unit/ssr.test.tsx` (ticket 02).
- Left out on purpose: "hydrated on the client" (the ticket's wording) - no browser hydration test exists (spec, out of scope), so the READMEs say "rendered on a server" only; no Next.js version; no Server Component claim.
- Changelogs: an "Added" line and a "Changed" line on the client component in each of the five; core also a "Fixed" line for `inert` on 18. `docs/testing.md` has a row on the job, `check:dist` and the ssr tests; `ci.yml`'s header comment lists the new checks. `docs/journal.md` untouched.
