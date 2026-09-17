# 02 — Material, radius, scrim

Status: done

Spec: `.scratch/command-palette/spec.md`
ADR: `docs/adr/0012-a-translucent-material-needs-a-floor.md`

## Scope

The token set has no translucency and no radius above `--u-radius-lg`. Without
both, the palette can only be the existing white box with better sorting. This
ticket adds them — to the token file, in both themes, as public tokens.

Three additions:

- **A radius step above `lg`**, for the pane. One value, both themes share it.
- **A translucent material**: a surface fill carrying alpha, plus the blur radius
  that goes beneath it. Dark gets its own values, chosen by eye, not derived by
  inverting the light ones.
- **A scrim**: the dimming of the page behind an overlay. It exists today as an
  inline `color-mix` in the demo stylesheet — exactly the local exception this
  work package refuses to add more of.

The material carries a **floor**: an alpha high enough that text drawn on it
never depends on what happens to be behind the panel. The ADR states why; this
ticket picks the number and proves it.

The contrast test is extended accordingly. It reads hex declarations out of the
token file and cannot evaluate a translucent surface — not because nobody wrote
that code, but because the effective background is unknowable at rest. So it
checks the label colour against the **opaque fallback beneath the material**,
which is the real worst case and a real check. The limitation is recorded in the
test file at the point where a later reader would otherwise assume coverage.

## Acceptance

- Tokens present in both themes, named in the file's existing style.
- Contrast test extended; the opaque-fallback pair passes 4.5:1 in both themes.
- A comment at that pair stating what the check can and cannot see.
- The ADR's floor and the token's alpha agree; if measurement forces a different
  number, the ADR moves, not the test.
- No component consumes the tokens yet. This ticket is the vocabulary only.

## Notes

**Look at it before believing it.** This is one of the two visual risks the spec
names: a translucent material may simply look foreign in a token set built for
industrial screens. Put the three tokens on a scratch panel over the existing
demo and judge it in both themes before ticket 04 depends on them. If it looks
wrong, the honest outcome is to keep the radius, drop the material, delete the
ADR, and say so — the palette is still worth building without it, and the spec's
closing note says which half to cut.

Blur is a rendering path that has differed between machines on one platform.
Ticket 08 owns that consequence; do not let it change the decision here.

## Comments

**Angesehen, bevor geglaubt (1 Sep 2026).** Die drei Token wurden auf ein
Wegwerf-Panel ueber einer nachgebauten Demo-Seite gelegt und in beiden Themen
angesehen, bevor 04 auf ihnen aufsetzt.

Der erste Satz Zahlen war im hellen Thema falsch. Schleier 0,38 und Alpha 0,78:
der Schleier drueckte die ganze Seite auf ein mittleres Grau, die Scheibe landete
darueber bei rund #e9e9e9, und statt eines Fensters ueber der Anwendung stand da
eine graue Platte darin. Lesbar war es die ganze Zeit - der Boden hielt -, aber
es sah nach Fehler aus. Dunkel brauchte die Korrektur nicht, dort trennt schon
die Helligkeit.

Jetzt: Schleier 0,30, Alpha 0,86. Gemessen an der eingecheckten Baseline liegt
der Seitengrund unter dem Schleier bei #b6b6b6 und die Scheibe bei #f2f2f3 -
sechzig Stufen Abstand, und die Seite scheint sichtbar durch. Der Boden ist
damit hoeher als noetig, was erlaubt ist: er ist ein Boden und keine Zielmarke.
Das Material bleibt, die ADR bleibt.
