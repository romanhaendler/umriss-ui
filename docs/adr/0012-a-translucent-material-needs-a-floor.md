# A translucent material needs a floor

Status: accepted
Date:   2026-09

The token set gains a surface you can see through. In a library built for plant
screens, where legibility is the entire point, that deserves an explanation.

The reason is that a command palette is not a card. It is a window over an
application, and the thing that makes it read as a window rather than as a panel
inside the page is that the page remains faintly present behind it. An opaque
rectangle in the middle of the screen reads as content; a translucent pane over a
dimmed, blurred page reads as a layer. That distinction is the whole of what the
maintainer asked for when they asked for the system's search, and no amount of
radius, shadow or type size substitutes for it.

The cost is that text on a translucent surface has no fixed background. Contrast
becomes a property of whatever the user happened to have on screen, which is to
say it becomes unknowable — and a ratio nobody can compute is a ratio nobody can
promise.

So the material carries a **floor**: an alpha high enough that the opaque colour
beneath it passes the contrast requirement on its own, with the translucency
contributing atmosphere and never legibility. What shows through is enough to see
that something is behind the panel and never enough to read it. A palette that
looked better at a lower alpha would be a palette whose text is legible by luck.

The blur is decoration under the same rule. It softens what shows through; it is
not what makes the text readable. Where `backdrop-filter` is unsupported or
switched off, the panel falls back to the opaque colour and is simply a solid
pane — quieter than intended, correct in every other respect.

The alternative considered and rejected was to keep every surface opaque and take
the system look only from proportion and motion. It is cheaper, it is safe, and
it does not arrive: without the material, the result is the panel that already
existed with better sorting.

## Consequences

The contrast test cannot evaluate this. It reads hex declarations out of the
token file and computes ratios against a known background, and the whole point of
a translucent surface is that its background is not known. The test therefore
checks the label against the **opaque fallback beneath the material** — the real
worst case, and a real check — and says so at the pair, so that a later reader
cannot mistake the absence of a translucent check for the presence of one.

The floor is a number in the token file and a rule in this document. If
measurement forces a different alpha, this document moves; the rule does not.

Screenshot baselines meet a rendering path that has differed between machines on
the same platform before. If blur proves unstable across runs, the affected tile
is photographed over a flat backdrop and the material is verified by computed
style instead. A flaky baseline is a reason to change how it is photographed, not
a reason to change the material.

The tokens are public, so an application's own overlays can match the palette
rather than approximate it. Migrating the library's existing overlays onto the
material is a separate decision with its own screenshot consequences, and this
document does not make it.

Dark gets its own values, chosen by eye. A translucent surface derived by
inverting a light one lands wrong, because what shows through differs in kind:
light text over a dark blur tolerates far less transparency than the reverse.
