# 03 — The checks: own text, own box, visible focus

Status: done
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

**Delivered.**

- `packages/demo/checks/ownBase.ts` (`checkOwnBase`), exported as `@umriss-ui/demo/checks/ownBase`, and one `own-base.spec.ts` per demo that passes every page except the overview. One test per page, light project only, with reduced motion and the demos' fixed clock. The assertion is `{ type, box, focus }` against three empty lists, so a failure prints every offender as `<example> › <element "text">`.
- **Own type** compares each element with text of its own against the computed `font-family` of its `.exampleStage`, which page.css puts on the browser default.
- **Own box** reads every element whose class matches a CSS-module class (`_<local>_<hash>_<line>`, the demo build's naming) or `uc-`/`kc-`.
- **Visible focus** starts at the example's code toggle and presses Tab until the focus leaves the example. It compares an element's `box-shadow`/`outline` - its own and its ancestors' inside the stage, so a `:focus-within` wrapper counts - while focused and after Tab has moved on. No `blur()`, so no component handler runs that a user would not trigger.
- **Found while building it:** a first version counted the browser's own ring (`outline-style: auto`) as an indication, and passed `Button`, which has no ring of its own since 01. The browser's ring does not count now. That was the "deliberately broken probe" of the acceptance, and a real one: on the button page the check now names all seven buttons.
- **Offenders after 03** (light, 66 pages; 17 green, 49 red). Pages / own type / own box / visible focus:
  - 04: 20 pages, 118 / 0 / 45
  - 05: 15 pages, 143 / 0 / 21
  - 06: 12 pages, 594 / 15 / 200
  - 07: 2 pages, 4 / 0 / 6
  The full list stands in `.scratch/styles-without-side-effects/offenders-03.md`.
- **For 08 (`docs/testing.md`):** add the own-base checks to the list of shared checks: what each asks, that they run light only, and that the example stage stands on browser defaults on purpose.
- `pnpm lint`, `pnpm typecheck` green; no unit test changed.
