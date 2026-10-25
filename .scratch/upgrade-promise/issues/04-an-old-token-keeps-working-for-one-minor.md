# 04 - An old token keeps working for one minor

Status: ready-for-agent
Type: task
Size: S

Blocked by: `03-a-renamed-prop-export-or-wording-key-keeps-its-old-name-for-one-minor.md`
Spec: `.scratch/upgrade-promise/spec.md`

## What to build

A token rename keeps the old name working for one minor, and development names an old token that the
application's own CSS sets or reads. Core and charts are the two packages that declare tokens, and both get
it. No token is renamed in this ticket.

- **The alias.** The old name is declared in the same tokens layer as `--u-<old>: var(--u-<new>);`, with
  the comment `/* @deprecated since 0.<N> - use --u-<new> */` that ticket 03's check holds. For that minor
  the library's own rules go on reading the old name. Setting either name, or reading either name, then
  works, and there is no cycle. The removal release moves the rules to the new name and drops the alias.
- **The scan.** Core's and charts' development modules gain `warnDeprecatedTokens(tokens)`, where `tokens`
  maps each old name to its new one.
  - It runs once per page, and only in development.
  - It walks `document.styleSheets` and their nested rules. A sheet whose `cssRules` throws (cross-origin) is
    skipped, and so is every rule inside an `umriss.*` layer.
  - It calls `warnDeprecated` for each old name that a remaining rule declares or reads in `var()`.
- **Who calls it.** Each component whose rules read a deprecated token calls it on its first render in
  development, in an effect, so that the application's stylesheets have loaded. The once-flag makes many
  callers one scan.
- **The recipe.** Add the token kind to ticket 03's entry in `CONTRIBUTING.md`, with these points:
  - the alias line and its marker;
  - the rules that keep reading the old name;
  - the scan and its callers;
  - the edge for the migration line: a new name set on an element below `:root` reaches the rules only from
    the removal release, because the alias resolves at `:root`.

## Acceptance criteria

- [ ] A unit test per package, in jsdom with `console.warn` spied on, adds a `<style>` that sets one
      fixture old name and reads another. The scan warns once for each, in the fixed wording.
- [ ] In the same tests, the same names inside `@layer umriss.tokens { ... }` give no warning, a second
      call of the scan gives no further warning, and `NODE_ENV=production` gives none.
- [ ] A test in a real stylesheet setting (jsdom's CSSOM is enough) shows that, with the alias and a rule
      reading the old name, setting the new name on `:root` and setting the old name on `:root` each reach
      that rule's computed value. If jsdom does not resolve custom properties, this one is a `@quick` visual
      check in core's demo.
- [ ] No component calls the scan yet: no token is deprecated, and the first rename adds the calls.
- [ ] `pnpm check core`, `pnpm check charts` and `pnpm -r check:dist` pass.
