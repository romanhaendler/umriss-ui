# 03: The legend's gestures

**What to build:** The legend offers what the research found standard: a double click, Alt/⌥+click or Shift+Enter shows only that series; on the only visible one it shows all. No gesture ever leaves the chart empty - one that would shows all instead, and the chart's live region announces it in English or German. The key help names Shift+Enter. A single click stays immediate; the flicker before a double click is accepted.

**Blocked by:** 02 (Chart: hiding series through the view)

**Status:** done

- [x] Interaction tests for double click, Alt-click, Shift+Enter, the only-visible case and the never-empty rule
- [x] The announcement is a wording key in both wordings
- [x] The 'Legend' page shows the gestures

## Comments

**2026-10-04, delivered.** `<Legend>`: a click toggles at once as before; a click with `detail >= 2` on the entry clicked first shows only that entry's series, judged by the hidden series before the first click (`Legend.tsx` keeps them in a ref) - so the double click's result does not depend on what its two clicks did, also where the first one met the never-empty rule; no `dblclick` listener. Alt/⌥+click and Shift+Enter (keydown, default prevented so the button does not click as well) show only it. "Only it" is all where it is already the only one visible (unnamed series aside, as they cannot be hidden); a state's entry shows only the bands of that state. The hook's `showOnly(name)` stays a plain setter (no flip back to all).

`view.ts`: `toggleHidden(hidden, names)` and `showOnly(names, series)` no longer apply the never-empty rule themselves; `hidesAll(hidden, series)` and `onlyVisible(names, hidden, series)` are new. The scene applies the rule in one place, `hideSome` (behind `toggleNames`, `toggleSeries`, `showOnly`, `showOnlyNames`), and where it shows all instead it writes the new wording key `allShown` into the polite live region at once (`say`, clearing a pending readout). A view handed in is still taken as given and says nothing.

Wording (`ChartsWording`, English and German): `allShown` ("Nothing would be left to see, so every series is shown." / "Sonst wäre nichts mehr zu sehen, darum werden alle Serien gezeigt."), `legendHelp` ("In the legend, Enter hides or shows a series, Shift+Enter shows only it." / "In der Legende blendet Enter eine Serie aus oder ein, Umschalt+Enter zeigt nur sie."), added to the plot's summary wherever a legend has a named series. `zoomHelp` reworded: "0 goes back to the axis' own span." / "0 kehrt zum eigenen Bereich der Achse zurück." (08 lists this reword; it is done.)

Tests: `legendToggle.jsdom.test.tsx` "The legend's gestures" (double click whatever its clicks did, double click on the only visible one, Alt+click with an unnamed series and again, Shift+Enter taken from the button, the announcement on a click, on a setter in German, Shift+Enter in the summary) and a state band's double click; `view.test.ts` rewritten for the split rules. Interaction: "the legend's gestures show only a series, and all again" (real dblclick, Shift+Enter, Alt+click on `hide-a-series`).

Demo: the 'Legend' page's sentence and about name the gestures; a `keys` table (Enter Space, Shift+Enter) and an accessibility paragraph; example 01's lead names them. No new example. Capability row in `docs/capabilities.md`.

Pictures (all inspected): renewed - page-legend (longer head), legend--hide-a-series (longer lead), legend--above-or-below (a sub-pixel shift under the longer page; content identical), light and dark.
