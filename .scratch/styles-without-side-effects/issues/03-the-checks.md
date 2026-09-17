# 03 — The checks: own text, own box, visible focus

Status: ready-for-agent
Type: task

Blocked by: 01
Runs in parallel with: 02. Owns `packages/demo/checks/` and the spec files that include them.

Spec: `.scratch/styles-without-side-effects/spec.md` ("Testing Decisions")

## Scope

Three browser checks in `packages/demo/checks/`, wired into the visual suites of
all three demos like the existing `accessibility`, `page` and `shell` checks,
running once per demo in the light project:

1. **Own text context.** For every example on every page: every element with a
   non-empty own text node computes a `font-family` different from
   `getComputedStyle(document.documentElement).fontFamily`. Exceptions are
   listed by example id with the reason ("loose example text").
2. **Own box.** Every element in an example whose `className` contains a class
   produced by a library CSS module (core/table: the hashed module classes —
   find a reliable marker, e.g. the `_<name>_<hash>` pattern or a data attribute
   the build can add) or a `kc-`/`uc-` class computes `box-sizing: border-box`.
3. **Visible focus.** For every example: press Tab until focus leaves the
   example; for each element that received focus, compare computed
   `box-shadow` and `outline` focused vs. blurred — at least one must differ.
   Elements whose focus is drawn on another element (e.g. a field's wrapper via
   `:focus-within`) are allowed if that element's style differs; say how the
   check finds it.

Each check prints every offender as `<demo> › <page> › <example> › <selector>`,
so 04–07 can work from the output.

## Acceptance

- The checks exist, are documented in their file head and in the list of checks
  of `docs/testing.md` **as a note under Comments for ticket 08** (08 edits the
  document).
- They run and are **red**; the full offender list is appended under Comments,
  grouped by owning ticket (04, 05, 06, 07).
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.
- A deliberately broken probe (a temporary example with a `<button>` whose
  focus style is removed) is caught by check 3; noted, not committed.

## Comments
