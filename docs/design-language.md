# The design language

**Precise and quiet, with palpable quality** — the guiding idea of this
workspace. It holds for `@umriss-ui/core`, `@umriss-ui/charts` and
`@umriss-ui/table` alike: the charts draw their axes and labels from the same
tokens the components use, and the table inherits both. What follows describes
the language; the words it is spoken in are fixed in `CONTEXT.md`.

## Design guidelines · the "Ink & Paper" concept

Light as the default. The language combines the typographic rigour and shadow
architecture of Vercel's Geist with the paper materiality of Attio.

**Type.** Geist Sans (400/500/600) as the UI typeface, Geist Mono for numbers,
logs and identifiers – both open source. Large titles run slightly compressed
(negative tracking); micro labels (eyebrows, table heads) in letter-spaced
capitals.

**Numbers in monospace.** Every numeric column and numeric input uses Geist Mono
with tabular figures. Sharp, exactly stacked digits are the system's signature.

**Colour.** Almost monochrome: ink (#171717) on paper (#fafafa/#ffffff).
The primary button is ink, not colour. A single accent (petrol) marks
interactive things and nothing else – focus, selection, links. Semantic colours
are muted, with pale surfaces for badges. Colour that appears always carries
meaning.

**Edges and depth.** Borders are 1 px shadows without offset ("edge") rather than
borders; cards are borderless and carry a multi-step shadow stack in which every
step has a job (edge · contact with the ground · soft depth). Cards lie like
paper on a table. Interactive elements stay flat.

**Focus.** On a field, its own edge grows to two pixels in the accent
(`--u-focus-edge`), in danger when the field is invalid – no glow, and no
browser outline beside it. On everything else (buttons, checkboxes, rows, links)
a soft accent glow (20 % opacity, `--u-focus-ring`). Unmistakable, never hard.

**Motion.** Motion explains a change of state; it does not decorate. Micro
transitions (hover, colour) run in 120 ms; choreographies use
`--u-duration-fast` (140 ms) and `--u-duration-medium` (200 ms) with a decisive,
softly landing curve (`--u-ease-out`). Overlays have an exit as well as an
entrance: modals grow minimally out of the depth, popovers settle 6 px – and on
closing everything runs backwards (including on Escape; the native `<dialog>` is
choreographed for it instead of being closed hard). The tab underline glides to
the active tab, cards collapse with an animated height (the content stays in the
DOM and is made inert), the checkbox draws its tick (320 ms – slow enough to
watch the line), skeletons shimmer instead of pulsing, buttons have a minimal
pressure point (scale 0.98), and toasts arrive with presence (8 px plus scale),
glide out to the right on leaving while the remaining ones move up gently over a
grid collapse – and pause their countdown for as long as the mouse rests on
them. `prefers-reduced-motion` switches every choreography off – the duration
tokens then fall to 0 ms.

**Squircles.** Where the browser supports `corner-shape`, every rounding of the
library's own elements is drawn as a superellipse ("squircle", as Apple does it)
rather than as a circular arc – a progressive refinement with no risk for older
browsers. The build adds it after every radius (`scripts/styles/ownBox.ts`); an
application's own rounded elements stay as the application drew them.

**Details for the connoisseur.** The text cursor in the library's input fields is
petrol (`caret-color`); the scrollbars of its scroll containers are slim and
follow the theme; browser autofill keeps the paper look including its edge. The
text selection and the page's scrollbars are the application's: the library
styles nothing it did not render (ADR-0021).

Every value lives as a CSS custom property (`--u-*`) in `src/styles/tokens.css`, in
the cascade layer `umriss.tokens`; an application overrides it outside a layer.
Components reach for tokens only – never for raw values.

## Dark theme

The dark theme is the standard `color-scheme`, not an attribute of the library.
Every token with two values is written `light-dark(<light>, <dark>)`, and every
component follows the scheme its element inherits:

```css
html.dark { color-scheme: dark; }        /* a switch of the application's own */
:root { color-scheme: light dark; }      /* or: follow the system */
```

Theme libraries (`next-themes`, Bootstrap's `data-bs-theme`, Mantine, MUI,
DaisyUI) set `color-scheme` themselves, so the components follow them with no
line at all. An application that sets nothing stays light, and a part of a page
can be dark on its own (`style="color-scheme: dark"`). The library sets
`color-scheme` nowhere (ADR-0021).

The decision whether to follow the system setting or to store a user's wish lies
deliberately with the application – the library only provides the token values.
Principles of the dark theme: no pure black, "sunken" surfaces are lighter than
the surface (the layer logic is preserved), accent and semantic colours are
lightened but stay muted. The primary button reverses its polarity: light
surface, ink as the text.

## The words for all this

This document describes the language. `CONTEXT.md` fixes the vocabulary, and the
two do not repeat each other — where a word here has a definition, it stands
there: **Token**, **Vocabulary**, **Edge**, **Shadow step**, **Tone**,
**Glyph**, **Motion origin** and the **Interaction-state canon**.
