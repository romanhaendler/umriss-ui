# 08 — Tile, baselines, and the records

Status: done
Blocked by: 07

Spec: `.scratch/command-palette/spec.md`

## Scope

**The tile.** The palette gains an entry in the outline and therefore a tile,
because the outline is the single list that drives the sidebar, the overview, the
palette itself, the screenshots and the accessibility check. The tile shows the
panel; the shell shows the window. Both are wanted: the tile is what gets
photographed and axe-checked like every other component.

**The baselines.** Screenshots in both themes, reviewed rather than accepted on
sight. Here the spec's second visual risk lands: whether a translucent, blurred
pane yields a baseline stable across runs. If it does not, the tile shows the
panel over a flat backdrop, and the material is verified in the shell test by
computed style rather than by pixels. Decide this by running it, and record which
way it went.

**The records.** Three documents fall out of date the moment this lands:

- `popover-seam`'s story 26 — "an agent implementing the command palette, I want
  an existing surface primitive" — was answered by contradiction rather than
  fulfilled: it assumed an anchored surface, and the palette is not one. Amend
  that spec's record rather than leaving a story standing that reads as unmet.
- `TESTS.md` — the level table and its counts.
- The spec's own status moves to `done` with the delivering commits, in the style
  the other specs in `.scratch/` use.

## Acceptance

- Outline entry and tile present; the tile appears in the sidebar, the overview
  and the palette without a second list being touched.
- Screenshot baselines in both themes, checked in, reviewed.
- If blur proved unstable: the fallback taken, and the reason written where the
  baseline decision lives.
- Axe passes on the new tile in both themes.
- `popover-seam` spec amended.
- `TESTS.md` counts updated.
- This spec marked `done` with its commits.

## Notes

Nothing here is difficult and all of it is the part that gets skipped. The
records especially: `popover-seam` is a delivered spec whose story 26 will
otherwise be read, years from now, as a promise this package failed to keep.

## Comments

**Wie die Baseline-Frage ausgegangen ist (1 Sep 2026).** Sie ist ausprobiert
worden und der Weichzeichner hat gehalten: das Bild des geoeffneten Fensters war
ueber wiederholte Laeufe stabil, und die Baseline ist in beiden Themen
eingecheckt. Der Ruecklauf auf einen flachen Grund war nicht noetig.

Aufgeteilt ist es aber anders als das Ticket es sich gedacht hatte, und zwar aus
einem technischen Grund. Die Kachel-Schleife fotografiert `[data-kachel="…"]`;
das Fenster liegt in der obersten Ebene und damit ausserhalb jeder Kachel. Die
Kachel `kommandopalette` zeigt deshalb wie jede andere Overlay-Kachel (Modal,
ConfirmDialog, Toast) den Ausloeser, und das Fenster hat ein eigenes Bild vom
ganzen Ausschnitt, ausserhalb der Schleife. Beides ist in beiden Themen
eingecheckt und angesehen.

Zusaetzlich, und unabhaengig von den Pixeln, prueft `funktionen-huelle.spec.ts`
ueber den berechneten Stil, dass die Scheibe das Material wirklich traegt (Alpha
und Weichzeichner) - der Ersatznachweis, den ADR-0012 vorsieht. Er steht auch
dann noch, wenn die Baseline spaeter doch flattert und gestrichen werden muss.

**Nebenbefund, nicht von diesem Paket.** `barrierefreiheit.spec.ts` meldet im
dunklen Thema unter Last gelegentlich Kontrastbefunde auf `buttongroup` und
`textarea` mit Zwischenfarben (z. B. #cc5f57 statt #d0655c). Auf dem
unveraenderten Stand vor diesem Paket reproduziert er genauso. Er gehoert zu dem
Flattern, das `navigation.ts` im Kommentar schon beschreibt, und ist hier
ausdruecklich nicht behoben worden.
