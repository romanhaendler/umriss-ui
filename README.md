# umriss

A pnpm workspace of React packages for data-dense applications — dashboards,
plant screens, long tables. The design language is **precise and quiet, with
palpable quality**: depth comes from soft shadows and fine light edges, not from
hard outlines or effects.

## The packages

| Package | Version | What it is |
|---|---|---|
| [`@umriss-ui/core`](packages/core/README.md) | 0.3.1 | The component library — forms, overlays, structure, the tree, the dock, the command palette. The package you install first |
| [`@umriss-ui/charts`](packages/charts/README.md) | 0.3.1 | Canvas charts — few kinds, drawn well. Depends on nothing but React |
| [`@umriss-ui/table`](packages/table/README.md) | 0.2.1 | The table, declared the way it reads: columns as JSX, typed against their rows. Takes `@umriss-ui/core` as a peer |
| [`@umriss-ui/schedule`](packages/schedule/README.md) | 0.1.1 | The schedule: subtasks on lanes over time, with transports, findings and controlled editing. Takes `@umriss-ui/core` and `@umriss-ui/charts` as peers |
| `@umriss-ui/demo` | — | The private shell all four demos are built from. Never published |

All four published packages are released under the npm tag `latest`, so a plain
`pnpm add` installs them.

`core` names the package you install first, not a layer the others sit on:
`@umriss-ui/charts` depends on nothing and will keep depending on nothing,
`@umriss-ui/table` enters `core` by its public entry only (ADR-0016), and
`@umriss-ui/schedule` enters `core` and `charts` the same way (ADR-0022).

## Quick start

```bash
pnpm add @umriss-ui/core
```

```tsx
import { Button, Card } from "@umriss-ui/core";
```

That is the whole setup. The package's JavaScript loads its own stylesheet, and
that stylesheet touches nothing but the library's own elements: no rule on
`html`, `body` or `*`, no `color-scheme` on the document (ADR-0021). Everything
lies in the cascade layers `umriss.tokens`, `umriss.base` and
`umriss.components`, so an application's own CSS always wins, and every token
can be overridden:

```css
:root {
  --u-font-sans: "Inter", system-ui, sans-serif;
  --u-color-accent: #0f766e;
}
```

**Light and dark** follow the standard `color-scheme` the application sets —
most theme switchers already do; one of your own writes
`html.dark { color-scheme: dark }`. **Fonts** are not loaded: Geist is
recommended and used when present (`@fontsource/geist-sans`,
`@fontsource/geist-mono`), the system fonts otherwise. **Browsers:** Chrome 123,
Firefox 120, Safari 17.5 or newer — the tokens use `light-dark()`.

## The demos

Online at **<https://romanhaendler.github.io/umriss-ui/>** —
[core](https://romanhaendler.github.io/umriss-ui/core/),
[charts](https://romanhaendler.github.io/umriss-ui/charts/),
[table](https://romanhaendler.github.io/umriss-ui/table/),
[schedule](https://romanhaendler.github.io/umriss-ui/schedule/). Rebuilt on every push
to `main` (`.github/workflows/pages.yml`); `pnpm build:pages` assembles the same
site locally into `site/`.

Locally:

```bash
pnpm install
pnpm dev:core      # port 4173
pnpm dev:charts    # port 4174
pnpm dev:table     # port 4175
pnpm dev:schedule  # port 4176
```

The demo **is** the documentation for the components. Every page shows running
examples together with the source that produced them and a props table generated
from `src/` — there is no prose description of a component that could drift away
from the component.

## Where the documentation is

* **[`docs/README.md`](docs/README.md)** — the map: which document answers which
  question. Start there.
* **[`CONTEXT.md`](CONTEXT.md)** — the shared vocabulary. One concept, one word,
  and the words it may not collide with.
* **[`docs/adr/`](docs/adr/README.md)** — the decisions, with the arguments that
  produced them.
* **[`CONTRIBUTING.md`](CONTRIBUTING.md)** — setup, commands, and how work is
  organised here.

## Maturity

Every package is `0.x`, and while the first digit is `0` no version number
promises compatibility. All four are released under `latest`. The release
candidates of `charts`, `table` and `schedule` stand in their changelogs, and so
do the numbers `core` counted inside this repository before its first release,
as *internal* ones. What changes for a caller stands in that package's own
`CHANGELOG.md`, and whatever changes existing behaviour stands there under a
heading of its own.

## Licence

MIT — see [`LICENSE`](LICENSE). Each published package carries the same licence
in its own directory, because npm packs it with the package.
