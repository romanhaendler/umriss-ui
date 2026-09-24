/* The German register, as freight behind `@umriss-ui/charts/wording/de`
   (ADR-0031): an application that never imports it never bundles it. */

import type { ChartsWording } from "./index";

export const GERMAN_CHARTS_WORDING: ChartsWording = {
  roleDescription: "Diagramm",
  empty: "Keine Daten",
  seriesCount: (count) => (count === 1 ? "1 Serie." : `${count} Serien.`),
  visibleRange: (from, to) => `Von ${from} bis ${to}.`,
  seriesExtent: (name, min, max) => `${name} von ${min} bis ${max}.`,
  walkHelp:
    "Pfeil links und rechts gehen durch die Werte, Pfeil hoch und runter wechseln die Serie, Pos1 und Ende springen zum ersten und letzten Wert, Escape hebt die Markierung auf.",
  zoomHelp: "Plus und Minus zoomen, Umschalt mit Pfeil links oder rechts verschiebt, 0 zeigt alles.",
};
