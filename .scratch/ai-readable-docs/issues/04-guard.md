# 04 - The completeness guard

Status: done
Type: task
Blocked by: 02

Spec: `.scratch/ai-readable-docs/spec.md`

## Scope

A4.

## Acceptance

- The guard fails when an export is missing from the text.

## Comments

Delivered: `packages/demo/tests-unit/llmsGuard.test.ts` - every name each
package's build entries export (subpaths included: `wording/de` of core and
charts) appears as a word of its own in its text. Red first, over all five:
the pages name what a reader looks up, not the pure modules and helper types
(dozens of names per package). Rather than a hand-kept allow-list, the text
now carries those exports' declarations (ticket 01), which is what an agent
needed anyway; the guard holds the rest - a subpath export, or an export the
declaration reader misses, fails it. `missingFrom` is unit-tested for the
failing case.

The second half of A4 - every example compiles as it stands there - has no
test of its own: the text carries the example through `displaySource`, the
same function the demo uses, and each package's typecheck compiles the file.

After review: a name counts only where it stands as code (a fence or an inline
span), so an export called like an English word is not named by a sentence;
and since the appendix makes the first check hold by construction for the main
entry, a second one keeps the guard honest - every component (an export with a
`<Name>Props` beside it) must be named by the pages themselves, not the
appendix.
