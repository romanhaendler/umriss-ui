# 06 — The pointer does not steal the highlight

Status: done
Blocked by: 04

Spec: `.scratch/command-palette/spec.md`

## Scope

The highlight has one owner at a time.

The **keyboard** takes ownership on any arrow key and on any change to the query.
The **pointer** takes ownership only on a genuine `pointermove` — never on
`pointerenter`, which fires when the list re-renders beneath a stationary cursor.

Without this, the failure is: you type, the list shortens, a different row slides
under a resting mouse, enter fires, and the highlight jumps away from what the
arrow keys had chosen. It is the defect nobody can name while experiencing it,
and today's palette avoids it only by having no pointer behaviour at all — which
ticket 04 takes away.

A click on a row chooses it, regardless of who owns the highlight.

## Acceptance

- jsdom test of the rule itself: `pointerenter` alone does not move the
  highlight; a `pointermove` does.
- The highlight returns to keyboard ownership on the next arrow key or keystroke.
- Clicking a row chooses it.
- The browser-level confirmation of the real scenario is owned by ticket 07,
  where there is a page to drive.

## Notes

One flag, and it is the difference between a palette that works and one that
feels right. It is worth its own ticket only because it is invisible in review: a
reader who has not met the defect will see a redundant guard and delete it. The
comment at the flag must name the failure, not describe the code.

## Comments

**Die Regel ist genau eine (1 Sep 2026).** Ein erster Anlauf machte mehr daraus:
er verglich die Koordinaten aufeinanderfolgender `pointermove` und liess nur eine
Bewegung mit veraenderter Stelle zaehlen - gegen ein `pointermove` auf der Stelle,
das ein Browser beim Scrollen nachschieben koennte. Gestrichen, aus zwei Gruenden.
jsdom kennt `PointerEvent` nicht und liefert `clientX`/`clientY` als `null`, die
Verfeinerung waere dort also gar nicht pruefbar gewesen; und sie ist eine
Vermutung ueber einen Browser und keine beobachtete Sache. Der Browser-Test in 07
faehrt jetzt den echten Fall - Zeiger geparkt, getippt, Liste schrumpft - und der
Haken bleibt, wo die Tastatur ihn gesetzt hat. Kommt das nachgeschobene
`pointermove` doch einmal vor, faellt dieser Test, und dann ist es ein Befund und
keine Vermutung mehr.
