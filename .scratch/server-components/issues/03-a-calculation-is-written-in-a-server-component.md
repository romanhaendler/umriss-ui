# 03 - A calculation is written in a Server Component

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-adr-and-what-each-readme-says.md`, `02-the-calculation-is-a-reader-and-a-view.md`
Spec: `.scratch/server-components/spec.md`

## What to build

A report page writes a `<Calculation>` tree directly in a Server Component, with numbers from its own data.
The page builds, and the reader gets the same calculation as from a client file. `check:dist` proves it with
React's own Flight renderer.

- **The build.** The package emits two files.
  - The entry has no directive. It holds the reader, the elements and the model, and it imports the client
    file.
  - The client file begins with `"use client"`, then its stylesheet import, then the view and the
    arithmetic.

  The entry's name, `exports` and `types` stay as they are, so an import is unchanged. Today's plugins
  write the directive and the stylesheet import onto every entry chunk. For this package they must write
  both onto the client file only. Keep the change inside the calculation's build config and the shared
  plugins' options. Every other package builds as before.
- **`check-dist`.** A package can name its server-safe entry; only the calculation does. For that entry the
  check asserts that it does not begin with the directive, and that it imports the client file. For the
  client file it asserts the directive followed by the stylesheet import. Every other package and entry
  keeps today's assertions unchanged.
- **The elements rendered on their own.** `Given`, `Sum`, `Difference`, `Product`, `Quotient`, `Ref`,
  `Chain`, `Plus`, `Minus`, `Times`, `DividedBy` and `Interim` still render nothing where a calculation
  reads them. Called as components, they throw the calculation's development error. It says the element
  stands only directly inside a `<Calculation>`, and that a tree written in a Server Component must be
  written inside the `<Calculation>` there, not passed through a client component.
- **The Flight check** goes in the calculation's `check:dist`, in the scratch consumer (spec, Testing
  Decisions):
  1. a server module imports the packed package and writes the costing example as a Server Component
     would;
  2. React's Flight server renders it, with the client file as the client reference;
  3. React's Flight client decodes the payload;
  4. `renderToString` turns the result into HTML.

  The HTML must hold the list's label, every row's label and an amount. A second case passes a tree
  through a client component and expects the development error's text. `react-server-dom-webpack` joins
  the root devDependencies, at the React version the workspace resolves. If that route can't be made to
  run, use the spec's fallback (an App Router fixture and `next build`) and record why under `## Comments`.
- **The README.** Calculation's `"use client"` paragraph says that a calculation can be written in a Server
  Component or a client file alike. It says that the package's entry carries no directive and its view
  does, and that a tree must stand directly inside its `<Calculation>`. Core's "Server Components"
  section gets one sentence naming the calculation as the view a Server Component writes itself.
- **Changelog:** calculation, a minor entry. Nothing a client-only app sees changes.

## Acceptance criteria

- [ ] `pnpm --filter @umriss-ui/calculation check:dist` runs the Flight check and passes.
- [ ] Putting `"use client"` back onto the entry makes the check fail with the Flight check's error and the
      head assertion. That proves the check isn't green by accident.
- [ ] Rendering `<Sum>` outside a calculation, in a unit test, throws the development error. A calculation
      whose tree comes from a `.map` still renders.
- [ ] Every other package's `check:dist` passes unchanged.
- [ ] `pnpm check calculation`, `pnpm check:site` and `pnpm test:visual:quick calculation` pass.
- [ ] The README paragraph and core's sentence say what the check proves, and no more.
