# The demo shell is shared by all three demos, and R-1.2 binds the package source

Status: accepted
Date:   2026-09

`@umriss-ui/charts` depends on nothing, and that is a promise about the
**published package**: nothing a caller installs may pull in `@umriss-ui/core`.
Until now the rule was written wider than the promise. The lint bound
`packages/charts/**`, demo included, and the demo was offered as a second piece
of evidence: look, even the demo runs without core.

That evidence cost a thousand lines. `packages/charts/demo/Shell.tsx` (391) and
`shell.css` (623) stood beside `@umriss-ui/demo`, **18 of their 29 class names
identical**, and the jump palette was built a second time by hand while the
shared shell uses `CommandPalette` — a component this workspace ships, tests and
photographs. The second implementation could also do less: no source beside the
example, no props table, no "Why it is like this", no copy button. The sentence
in the test document — the demo **is** the documentation — held for two packages
out of three.

## Decision

The lint rule narrows to `packages/charts/src/**`. `packages/charts/demo/**` and
`packages/charts/tests-visual/**` may import `@umriss-ui/core`, and the charts
demo moves into the shared shell `@umriss-ui/demo`, which imports core.

## What carries the claim afterwards

The demo was the weakest of the four checks, because it proved something about
the demo rather than about the package. The other three are unchanged, and each
one is mechanical:

1. **The lint rule** forbids `@umriss-ui/core` in `packages/charts/src/**` —
   unchanged in force, narrowed in scope. A deliberate import there still fails
   `pnpm lint`.
2. **The manifest** names `@umriss-ui/core` in neither `dependencies` nor
   `peerDependencies`. It is a `devDependency` beside `@umriss-ui/demo`, and
   both are used by `demo/` only.
3. **The package's own tests** mount it without core, including the SSR test.
4. **`files` ships `dist/` and `CHANGELOG.md`.** `pnpm pack --dry-run` carries
   nothing from `demo/`; the demo is not part of what anybody installs.

That is a stronger set than "the demo happens not to import it".

## The alternative, and why it was not taken

`CommandPalette`, `useCommandPaletteShortcut` and `LanguageProvider` could have
been pulled out of the shell behind a `palette?: ReactNode` prop, so that
`@umriss-ui/demo` imports nothing from core and R-1.2 survives word for word. It
works. It was the recommendation until the claim turned out to be negotiable.

It is not taken because the price is paid in the wrong place: a seam through the
shell, a palette passed in by three call sites, and the demo of `core` no longer
showing its own palette in the position a reader meets it. That is architecture
bent around a piece of evidence the lint rule already carries.

## Consequences

* The charts demo gains source display, props tables, "Why it is like this", the
  copy button, the real palette and a derived screenshot list.
* `@umriss-ui/demo` is the shell for three demos, not two; its description and
  the lint message that named charts' own shell are corrected with it.
* Reversing this costs an afternoon: the alternative above is the route back.
* *Added Sep. 2026:* the shell has carried a fourth demo since
  `@umriss-ui/schedule` (ADR-0022). The title's "three" is the count at the time
  of the decision; nothing in the decision depends on it.
* *Added 23 Sep. 2026:* and a fifth since `@umriss-ui/calculation`.
