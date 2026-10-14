# 01: The package and a dashboard that shows

**What to build:** `@umriss-ui/dashboard` exists as the workspace's seventh package and draws a **Dashboard** a developer declares: a developer calls `useDashboard` with a default arrangement and a reader's kept one, declares each **Widget type** as JSX, and the reader sees the **Widgets** in the stored order, each at its **Widget size**, packed strictly on twelve columns, each in a frame with its title. Nothing can be edited yet. See `spec.md` (Implementation Decisions: Package, Declaration, The View, Widget sizes, Packing, The frame) and ADR-0064.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] The package is wired into the workspace like the other five: `pnpm check dashboard`, lint, `pnpm typecheck`, the visual configuration with its own demo port (the next free one after 4177), `pnpm test:visual:quick dashboard`, the changelog's package list and the site build. Peers are `@umriss-ui/core` and React `>=19`; there is no other dependency; it reaches core only by its public entry.
- [ ] `useDashboard` takes the default view and `initialView` (read once, ADR-0047) and hands back `Dashboard`, `WidgetType`, the current view and `setView` (not reported). Without `initialView` the default is shown.
- [ ] The view has the shape fixed in the spec (`{ widgets: [{ id, type, size, options }] }`), and `WidgetSize` is the closed set `small | medium | wide | tall | large | full`.
- [ ] A `WidgetType` declares its name, a label, a sentence, the sizes it offers with the columns and rows each takes, its starting size, its default options and its content as a function of `{ size, options }`; the options type is inferred from the default options and checked in the content (a type test).
- [ ] The widgets are packed by the strict rule of the spec (each at the first place at or after the previous one) on twelve equal columns and fixed rows; the library places each widget on its grid lines and the browser sizes the columns.
- [ ] The widgets stand in the document in the stored order.
- [ ] Every widget stands in a frame in core's card look, with its title in the head.
- [ ] The dashboard renders on the server without a layout engine.
- [ ] The demo has a page with one example: a dashboard of four or five widget types in the style of prototype 2's default for the dispatcher role, each example carrying its own data. `API.md` is generated and current.
- [ ] Tests: the hook rendered in jsdom (what is shown, in what order, at which size, the content told its size, `setView`), the packing rule as a pure function across its cases (row breaks, a widget wider than the columns, tall widgets beside short ones), a server render, and one browser test that the library's placement equals what the grid draws.
