# 08: Records and release

**What to build:** One release breaks charts, table and schedule once, and says how to move: a migration table old → new in every changelog, covering both efforts. The capability record lists the view, `zoomable`, `zoomLimits`, 'Show all' and the gestures, drops 'clamping is the caller's', and puts a navigator under 'Later'. The READMEs and CONTEXT.md agree with the code.

**Blocked by:** 01-07 and `charts-bound-to-rows` 01-08

**Status:** ready-for-agent

- [ ] Every removed prop and export appears in a migration table
- [ ] Every suite green; the release builds

## Comments

### Left over from 06 (2026-10-04)

Still say "manual mode": `docs/testing.md` (also names the old test files
`manualMode.test.tsx`, `manualModel.test.ts`, now `serverMode.test.tsx`,
`serverModel.test.ts`) and two doc comments in core's
`src/lib/language/wording.ts`. ADR-0042 and `docs/journal.md` mention it as
history and stay. From charts-bound-to-rows 02: the Installation page's lead
still says "through an accessor" - reword with 05 or here.

### Open for the acceptance (from charts-bound-to-rows 07)

`TooltipPoint.value` - what a custom tooltip `render` reads - is a matrix
cell's colour, now called `level` everywhere else. Renaming it is a further
public break; put the question to the user at the acceptance.

### Known limit to name at the acceptance (from the echo fix, 75173127)

A view handed in that equals one the component reported less than a second
ago (and not yet echoed) is taken for its own echo and not applied - so an
application that restores a just-reported view within that second sees no
change. The `Echoes` rule exists three times (table, schedule, charts):
charts depends on nothing, so it cannot share core's copy.

### Left over from component-view 01 (c6b8eb5a)

- The demo shell forwards moved page ids, not example anchors:
  `/axis/#zoom-and-pan`, `/axis/#visible-domain`, `/chart/#cursor-sync` land
  on their old page without the example. Decide whether the shell should
  forward anchors too, or name it in the changelog.
- The keyboard help says "0 shows everything"; `0` returns to the axis' own
  `domain` (usually the whole data). Reword (`zoomHelp`, both wordings).
- The visual suite was not re-run after the last echo-rule change; the final
  full suite covers it.
