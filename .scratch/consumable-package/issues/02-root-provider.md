# 02 — Root provider

Status: done

Blocked by: `01-formatting-and-wording-seam.md`

Spec: `.scratch/consumable-package/spec.md`

## Scope

One place to configure the library, holding exactly five things: the theme, the
density, the portal target for overlays, the toast configuration, and the
formatting-and-wording configuration.

- **Optional, and its absence is the tested default.** Every component renders
  and behaves exactly as it does today with no provider above it. Components
  read configuration through a hook that returns defaults when there is nothing
  to read.
- Theme handling covers the three states the library already implies: explicit
  light, explicit dark, and following the system setting — where following means
  subscribing, so a change while the application runs is honoured. The provider
  writes the attribute the token layers already key off; the token layers
  themselves do not change.
- The portal target defaults to today's behaviour, including the popover seam's
  rule about portalling into the nearest dialog ancestor.

## Acceptance

- A test that a component with **no provider** behaves as it does today, for at
  least one component of each kind that reads configuration. This is the
  important one.
- A provider with a given theme produces the corresponding attribute; following
  the system setting responds to a change.
- A wording override reaches the component that uses the entry, and a partial
  override falls back for the entries it omits.
- No screenshot baseline moves.

## Notes

It holds five things and nothing else. The moment it can configure a button's
default variant it stops being a small decision and becomes a second API surface.

Once the provider exists it will be tempting to require it, because the code is
simpler when configuration is always present. Resist that while the package has
consumers that do not use it: a library whose components work standalone can be
adopted one component at a time, and that is worth more than the simplification.

Ordering note beyond this spec: handoff work package B.13 (density) should read
from this provider, so B.13 lands **after** this ticket.

## Comments

**Umgesetzt, Aug. 2026.** `UmrissProvider` liegt in
`packages/ui/src/lib/anbieter/`. Er haelt die fuenf Dinge und nichts sonst:
`thema`, `dichte`, `portalZiel`, `toast`, `sprache`.

* **Thema.** Setzt `data-theme` an der Wurzel – das Attribut, auf das die
  Token-Ebenen schon hoeren; an den Token selbst aendert sich nichts.
  „system" abonniert `matchMedia` und nimmt einen Wechsel zur Laufzeit mit.
  Ohne Angabe fasst der Anbieter das Attribut nicht an, und beim Abbau legt
  er zurueck, was vorher dastand.
* **Portalziel.** Die Regel des Popover-Seams geht vor: der naechste
  `<dialog>`-Vorfahre schlaegt die Einstellung, sonst laege ein Panel aus
  einem Modal heraus hinter dem Dialog. Danach die Einstellung, zuletzt der
  Body. Eine Funktion wird beim Oeffnen ausgewertet.
* **Dichte.** Wird gehalten und ueber `useDichte()` angeboten, schreibt aber
  bewusst kein Attribut: das ist Arbeitspaket B.13, und ein Attribut, das
  niemand liest, waere toter Code. Ein Test haelt das fest.
* **Meldungen.** Voreingestellte Anzeigedauer; die einzelne Meldung schlaegt
  sie weiterhin.

Der wichtigste Testblock ist „Ohne Anbieter – der gepruefte Normalfall":
je eine Komponente jeder Sorte, die ueberhaupt Konfiguration liest
(Eingabe, Zustandsanzeiger, Overlay, Meldung), plus der Nachweis, dass das
Themenattribut unberuehrt bleibt. 19 Tests, keine Baseline bewegt.
