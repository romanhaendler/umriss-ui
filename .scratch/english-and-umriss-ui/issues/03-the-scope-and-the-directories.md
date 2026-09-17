# 03 — The scope and the directories

Status: done
Type: task

Blocked by: 02

Spec: `.scratch/english-and-umriss-ui/spec.md` (Solution; `core` means the component library)

## Scope

The mechanical move to the new npm scope. **No identifier is translated in this ticket** — mixing the scope change with the language change makes both diffs unreadable, and this one must stay small enough to verify by eye.

- `packages/ui/` → `packages/core/`, with `git mv` so history follows.
- Manifests: `@umriss/ui` → `@umriss-ui/core`, `@umriss/table` → `@umriss-ui/table`, `@umriss/charts` → `@umriss-ui/charts`, `@umriss/demo` → `@umriss-ui/demo`. Versions unchanged. `@umriss-ui/demo` keeps `private: true`.
- Build outputs follow the name: `dist/umriss-ui.js` → `dist/core.js` and its `.css`, and the same for table and charts. Check `vite.config.ts` `lib.fileName` in all three.
- Every import specifier across all four packages, plus `peerDependencies`, `devDependencies` (`workspace:*`), and the root `package.json` scripts (`dev:ui` → `dev:core`, and the `lint` path list).
- `eslint.config.js`: every `group:` pattern and the message text of each boundary rule. The rules themselves do not change — `charts` stays standalone, `table` still enters `core` only by the public entry (ADR-0016).
- `tsconfig.base.json` paths, the three `vite.demo.config.ts`, `playwright.config.ts`, `vitest.config.ts`.
- The repository directory stays `umriss`.

The ESLint messages are German and stay German in this ticket; ticket 14 translates them.

## Acceptance

- `pnpm install`, `pnpm typecheck`, `pnpm lint`, `pnpm test:unit` all pass.
- `grep -r '@umriss/' --include='*.ts' --include='*.tsx' --include='*.json' --include='*.js' packages *.json *.js` finds nothing.
- `pnpm build` produces `dist/core.js`, `dist/table.js`, `dist/charts.js` and their stylesheets.
- No baseline moved: `pnpm test:visual` is as green as it was before the ticket.

## Finding: two baselines were already red before this ticket

`pnpm test:visual` after this ticket: **568 passed, 2 failed** -
`Seitenkopf uebersicht` in the table demo, both themes. They were red before it
too, so the acceptance ("as green as it was before the ticket") holds, but the
reason is worth writing down rather than rediscovering in ticket 16.

The two files were last written by `table-demo`. `table-filters` 07 renewed twenty table baselines - every example and page it
believed it had touched - but not these two, although it changed exactly what
they show: the overview page head counts the demo's pages and examples and
names its rubrics, and that ticket took the page count from 11 to 12, the
example count from 41 to 46, added a `Filter` tag and renamed the rubric
"Leiste" to "Freie Bausteine". The baseline still shows the old four.

The overview page head is derived from `gliederung.ts` and is therefore the one
image in the table demo that moves whenever a page is added - which is why it
is easy to miss when renewing the baselines of the pages one did touch.

This ticket adds one more difference on top: the page's own sentence names the
package, so `@umriss/table` -> `@umriss-ui/table` reflows that paragraph. The
rendered page was looked at: nothing is clipped, nothing wraps that did not
wrap, the layout is intact.

Not fixed here. Ticket 16 is the only ticket permitted to move a baseline, and
it now names these two (see its Inherited section).
