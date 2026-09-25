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
paper on a table. Interactive elements stay flat. The one edge drawn as a
border is the file input's drop zone: dashed, because a dash is what says
"put it here" on every desktop, and a shadow cannot be dashed.

**Focus.** A crisp accent edge of two pixels (`--u-focus-ring`), the same on
every component – no glow, and no browser outline beside it. On a field it lies
where the field's edge lies, so the edge seems to grow; an invalid field keeps
its danger colour (`--u-focus-ring-danger`). Unmistakable, never soft. Beside
every ring stands one outline, `2px solid transparent`: it paints nothing, but
forced colours (the Windows contrast mode) drop every box-shadow and paint the
outline in a system colour, so the ring stays where it was. That outline is the
one thing a focus rule may draw besides the ring token, and every rule that
draws the ring has to draw it - the stylesheet check holds both
(forced-colors 01).

**States.** One logic by means, not by values (the **interaction-state
canon**): hover changes the surface - a quiet key sinks to
`--u-color-surface-sunken`, a field's edge darkens; a press changes it more
strongly (`--u-color-surface-pressed`, or the `-pressed` step of a tinted
ground) and a button or a glyph may settle besides; focus is the ring and only
the ring, never a surface, and no hover edge outweighs it; disabled dims to
half and reacts to nothing - no hover, no press, the not-allowed cursor. What
has no surface of its own - a tab, a link, a header's sort label, a segment -
darkens its type instead, and says so where it does. The stylesheet check
holds the three means that can be read off a rule; the exceptions stand there
with their reasons.

**Forced colours.** The Windows contrast mode repaints every colour with a
system colour and drops every box-shadow - and edges, depth and rings are all
box-shadows here. So every edge and every card's or overlay's depth carries
`outline: 1px solid transparent` where the edge lies (the stylesheet check
holds it), and a state that was a ground alone takes a system colour inside
`@media (forced-colors: active)`: a chosen or active item an outline in
`Highlight` (inside it, two pixels; a band one), a fill that is the value -
progress, a meter, a slider's track, a switch that is on, a tab's underline -
`Highlight`, a mark that was ink - a checkbox's dash, a radio's dot, a divider,
a group's share bar, a pinned block's edge - `CanvasText`. A system colour an
author names survives forced colours; nothing else does, and a gradient not at
all - the slider's track takes `forced-color-adjust: none` to keep its
gradient, in system colours. A verdict keeps its word and its glyph. A tone
told by colour alone - the meter's - is not kept: FC3 keeps a colour only
where a word stands beside it, and no such chip needed it yet.
The canvases paint themselves in the system colours (the charts' theme, the
schedule's `FORCED`). The finer settling is the polish round's
(forced-colors 04).

**Motion.** Motion explains a change of state; it does not decorate, and
every motion has a name in `tokens.css` - a motion that fits none of them wants
a new token, not a number in its module. Three distinctions carry the names.
*Micro or path*: a colour, an edge or an opacity changes in place in 120 ms
(`--u-transition`); something that turns or slides takes
`--u-transition-path` (140 ms), a longer way `--u-duration-medium` (240 ms); a
press point is shorter than both (`--u-transition-press`, 80 ms, scale 0.98 on
a button, 0.8 on a glyph). All of them run on one decisive, softly landing
curve, `--u-ease-out`. *Entry or exit*: overlays unfold from their **motion
origin** - the edge of the panel facing its trigger, computed from the same
side and alignment that position it (`motionOrigin` in `position.ts`): a menu
below its button grows from its top left, a flipped one from its bottom, a
tooltip from the edge towards its trigger, a toast out of the corner it
stands in, a modal - which hangs from no trigger - from its centre, a drawer
from the edge it stands at, sliding the whole way in on
`--u-duration-medium`. Panels,
tooltips and the modal enter by scale (0.96) and opacity, a toast rises 8 px
as it grows; they leave faster (`--u-duration-exit-fast`
100 ms for panels, `--u-duration-exit` 160 ms for a sheet) on `--u-ease-exit`,
a curve that starts at once, and fade where they stand instead of retracing
the way they came - a symmetrical exit makes a surface feel sluggish. The
native `<dialog>` is choreographed for it instead of being closed hard,
Escape included. *Continuous process*: the spinner turns
(`--u-duration-spin`, `--u-ease-steady`), skeletons shimmer instead of pulsing
(`--u-duration-shimmer`, `--u-ease-swell`), and an indeterminate progress bar
sweeps its track (`--u-duration-sweep`) - under reduced motion slower, never
still, since a bar at rest would say the task has stopped. And the details: the tab
underline glides to the active tab, cards collapse with an animated height
(the content stays in the DOM and is made inert), the checkbox draws its tick
(`--u-duration-draw`, 320 ms - slow enough to watch the line), and toasts
glide out to the right on leaving while the remaining ones move up gently over
a grid collapse - and pause their countdown for as long as the mouse rests on
them. `prefers-reduced-motion` drops the path, never the state change: the
duration tokens fall to 0 ms, a panel appears and goes at once - but it
appears - and no focus style hangs on an animation.

**Squircles.** Where the browser supports `corner-shape`, every rounding of the
library's own elements is drawn as a superellipse ("squircle", as Apple does it)
rather than as a circular arc – a progressive refinement with no risk for older
browsers. The build adds it after every radius (`scripts/styles/ownBox.ts`); an
application's own rounded elements stay as the application drew them. One
exception, by rule: **a mark that shows a state is round, a key is not.** The
stepper's markers are circles (`corner-shape: round`): they say where a
procedure stands and are pressed by nobody, and a squircle that small is a
rounded square - ticked, it would read as a checkbox to press. Whatever can be
pressed keeps the squircle (core-layout-extras 04).

**Details for the connoisseur.** The text cursor in the library's input fields is
petrol (`caret-color`); the scrollbars of its scroll containers are slim and
follow the theme; browser autofill keeps the paper look including its edge. The
text selection and the page's scrollbars are the application's: the library
styles nothing it did not render (ADR-0021).

Every value lives as a CSS custom property (`--u-*`) in `src/styles/tokens.css`, in
the cascade layer `umriss.tokens`; an application overrides it outside a layer.
Components reach for tokens only – never for raw values.

## Colour for the abnormal (ISA-101)

ISA-101, the standard for high-performance operator screens, asks for what
"Ink & Paper" already does: a grey base, and colour reserved for the abnormal,
so that the one red thing on a screen is found in the corner of an eye. umriss
names the rule here so that it stays deliberate (the norm text is paywalled;
what umriss takes from it, and from which secondary sources, stands in
[`standards.md`](standards.md)).

**Grey is the normal state.** Ink on paper, the accent only for what can be
operated. A value inside its limits, an alarm in service and acknowledged, a
fresh reading - none of them needs a colour, and none gets one beyond the
muted "ok" of a verdict word.

**Colour is for the abnormal.** Danger, warning and success come from the
verdict, the lifecycle or the freshness - never from a component's wish to look
lively. A hidden alarm (shelved, suppressed, out of service) is a decision
already taken and is drawn without its colour: neutral, but there, with its
state as a word.

**Never colour alone.** Every verdict colour stands beside a word or a glyph
that says the same thing - the lifecycle written out beside its edge, the
verdict glyph with a shape per verdict, the toast's tick and cross. A reader
who cannot tell red from green, a grey-scale print and a screen reader lose
nothing.

**Where umriss departs, and why.** The danger button and a menu's destructive
item are red for a *consequence*, not for an abnormal state; their label names
the action. The "ok" verdict is tinted green on its word, where a strict
ISA-101 screen would leave normal grey - it is a verdict the caller asked for,
not the resting state of the screen.

**The check.** `packages/core/tests-unit/verdictColour.test.ts` keeps a
register of every stylesheet of the library that reaches for a verdict colour,
each with what carries its meaning without the colour; a new one fails until
that is written down. It is per stylesheet, not per rule, and it cannot see
the caller's content: a badge of tone "danger" with no children is colour
alone, and only the caller can prevent it. The alarm list and the verdict
column hold their promise beyond the register, in their component tests.

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
