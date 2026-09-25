/* The German register, as freight behind `@umriss-ui/charts/wording/de`
   (ADR-0031): an application that never imports it never bundles it. */

import type { ChartsWording } from "./index";

export const GERMAN_CHARTS_WORDING: ChartsWording = {
  roleDescription: "Diagramm",
  empty: "Keine Daten",
  seriesList: (names) => `${names.length === 1 ? "1 Serie" : `${names.length} Serien`}: ${names.join(", ")}.`,
  visibleRange: (from, to) => `Von ${from} bis ${to}.`,
  seriesExtent: (name, min, max) => `${name} von ${min} bis ${max}.`,
  readout: (x, rows) => [`${x}.`, ...rows.map((r) => `${r.name} ${r.value}${r.x === "" ? "" : ` bei ${r.x}`}.`)].join(" "),
  stackTotal: "Summe",
  percent: (value) => `${value} %`,
  walkHelp:
    "Pfeil links und rechts gehen durch die Werte, Pfeil hoch und runter wechseln die Serie, Pos1 und Ende springen zum ersten und letzten Wert, Escape hebt die Markierung auf.",
  zoomHelp: "Plus und Minus zoomen, Umschalt mit Pfeil links oder rechts verschiebt, 0 zeigt alles.",
  showData: "Daten zeigen",
  hideData: "Daten verbergen",
  positionColumn: "Position",
  rowColumn: "Zeile",
  tableCaption: (from, to) => `Werte von ${from} bis ${to}.`,
  downsampled: (readings) =>
    `Ausgedünnt aus ${readings.toLocaleString("de-DE")} Messwerten: erster, kleinster, größter und letzter Wert je Abschnitt.`,
};
