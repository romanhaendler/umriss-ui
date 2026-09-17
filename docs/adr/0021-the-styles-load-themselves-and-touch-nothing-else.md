# The styles load themselves, and they touch nothing else

Status: accepted
Date:   2026-09

Until now a caller wrote two imports, and the second was not optional:

```tsx
import { Button } from "@umriss-ui/core";
import "@umriss-ui/core/styles.css";
```

The JavaScript loaded no CSS. Forgetting the second line produced no error, only
an interface without a single style — the worst way to fail, and the README
needed a paragraph to catch it. And what the line loaded was more than the
components: `global.css` set the font, colour, background and size of `html`,
`body { margin: 0 }`, `box-sizing` on every element of the page, a focus ring on
everything focusable, the scrollbars, the text selection and squircle corners on
`*`; `tokens.css` set `color-scheme: light` on `:root`; and `UmrissProvider`
wrote `data-theme` and `data-density` onto `<html>`. An application that
imported one button got a different page.

Three goals decide this, and they were set together:

1. **A caller imports as little as possible** — the component, nothing else.
2. **Importing it has no effect on the application** beyond the component.
3. **Every token can be overridden**, without `!important` and without caring
   about the order the stylesheets arrive in.

## Decision

**Each package's JavaScript imports its own stylesheet.** `import { Button }
from "@umriss-ui/core"` is the whole setup. `sideEffects: ["**/*.css"]` keeps a
bundler from shaking the import away. `@umriss-ui/core/styles.css` stays as an
export for setups that link stylesheets by hand; it is no longer required.

**Everything the library writes lies in cascade layers**, `@layer umriss.tokens,
umriss.base, umriss.components` — the tokens, the text context components share
(below every component's own rules, so a component's size or colour always
wins), and the components. CSS an application writes outside a layer wins over
every rule of the library, whatever its specificity and whatever the order of
loading. A token is overridden with `:root { --u-color-accent: … }`.

**No rule of the library selects anything it did not render.** There is no
`global.css`. No selector targets `html`, `body`, `*` or a native element outside
a component, and the only rules on `:root` declare custom properties. What
components needed from the base layer, they carry themselves:

- `box-sizing: border-box` on their own elements — never on content a caller
  places inside them.
- A text context — font family, size, line height, colour, smoothing — on every
  component that renders text and on every portalled panel. Pure layout
  (`Stack`, `Grid`) sets none, so a caller's content inside it keeps the
  caller's type.
- A visible `:focus-visible` ring on every element they make focusable.

**The font is set through a token, not inherited.** `--u-font-sans` and
`--u-font-mono` name Geist first and end in the system fonts. Nothing is loaded:
an application that has Geist gets it, one that does not gets its platform's
font, and one that wants its own sets the token. Inheriting the application's
font instead was rejected: it is the same side effect in the other direction —
a caller's `body { line-height: 2 }` or a display face would move the stat, the
table and the pickers, and no picture of a component could be taken that holds
in any application.

**Light or dark is the standard `color-scheme`, not an attribute.** Every token
with two values is written once, `light-dark(<light>, <dark>)`, and resolves
against the `color-scheme` the element inherits. The library sets `color-scheme`
nowhere. An application switches its mode the way it already does — `next-themes`,
Bootstrap, Mantine, MUI and every DaisyUI theme set `color-scheme` themselves;
an application of its own writes `html.dark { color-scheme: dark }`, which its
native controls need anyway — and the components follow. An application that
says nothing stays light, so a light-only application never turns dark because
the operating system did. `UmrissProvider` loses `theme`, and it stops writing
`data-density`, which no stylesheet read.

## Alternatives

- **`data-theme="dark"`, as before.** It is one convention among many — Tailwind
  and `next-themes` use a class, Bootstrap `data-bs-theme`, DaisyUI
  `data-theme` with theme names rather than `dark` — so most applications would
  have kept a second switch for the library's mode. It is also a common enough
  name to collide.
- **A namespaced `data-umriss-theme`.** No collision, but a second switch in
  every application, always.
- **Injecting a `<style>` element from JavaScript.** Works without bundler
  support for CSS, but breaks under a `style-src` content security policy, styles
  only once the script runs, and lands after the application's CSS — which makes
  overriding harder, the opposite of goal 3.
- **An optional `@umriss-ui/core/base.css`** carrying the old base layer. A
  second way to set the library up, documented, tested and asked about, for
  choices — page margin, page scrollbars, selection colour — that belong to the
  application.
- **An entry without CSS** (`@umriss-ui/core/unstyled`) for Jest and similar.
  Not now: Vitest handles CSS imports, Jest has `moduleNameMapper`, and an entry
  added later breaks nobody while an entry removed later does.

## Consequences

- **A browser floor.** `light-dark()` exists since Chrome 123, Firefox 120 and
  Safari 17.5 (May 2024); `@layer` since 2022. An older browser discards the
  tokens and shows the interface unstyled. The READMEs say so.
- **Type sizes stay in `rem`.** They follow the root font size, which is how a
  reader's own font-size setting reaches the components. An application that
  shrinks its root font shrinks them too; that is accepted.
- **A portal follows the `color-scheme` where it lands.** A panel portalled to
  `body` from a subtree an application made dark on its own is light. The
  portal target (`UmrissProvider portalTarget`, or the nearest `<dialog>`)
  decides, as it already decides position and stacking.
- **The charts resolve colours for the canvas differently.** A custom property
  read with `getComputedStyle` returns `light-dark(…)` as text, which a canvas
  cannot draw; the colour is resolved through a real colour property instead,
  and a change of `color-scheme` invalidates the cached theme.
- **The demos prove it.** Their pages carry no font, colour or box model of
  their own around the examples, so every screenshot shows a component standing
  on nothing but itself.
- **`@umriss-ui/charts` loses its last unprefixed-looking global names.** Its
  classes were `.kc-*`, a leftover of the library's former name; they become
  `.uc-*`, in the same layer as everything else.
