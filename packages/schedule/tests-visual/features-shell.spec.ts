/* The shell, checked against this demo. The tests stand once, with the shell
   (`@umriss-ui/demo/checks/shell.ts`), and run against every demo; here stand
   the pages and queries they can be checked against in @umriss-ui/schedule. */

import { checkShell } from "@umriss-ui/demo/checks/shell";

checkShell({
  packageId: "schedule",
  notOnTheFrontDoor: ["schedule", "move-and-lane"],
  scenario: "replan-the-day-on-the-line",
  rail: { name: "Dependencies", pageId: "dependencies", rubricId: "plan" },
  low: { name: "Ripple", pageId: "ripple" },
  neighbours: [
    { name: "Installation", pageId: "installation" },
    { name: "First schedule", pageId: "schedule" },
  ],
  deepLink: { pageId: "findings", absent: "schedule" },
  example: { pageId: "dependencies", id: "violated-dependency", title: "Show a lag that does not fit", pageName: "Dependencies" },
  palettePage: { query: "findings as data", name: "Findings as data", pageId: "findings", rubricName: "Reading" },
  abbreviation: { query: "sbt", find: "Subtasks", glyphs: ["S", "bt"] },
  pointer: { wide: "s", narrow: "lag that does" },
  contents: { pageId: "dependencies", id: "violated-dependency", title: "Show a lag that does not fit" },
  foldedRow: { pageId: "schedule", id: "ScheduleProps-onIntent" },
  prop: { query: "laneHeight", label: "laneHeight", group: "schedule · ScheduleProps", pageId: "schedule", id: "ScheduleProps-laneHeight" },
  apiIndex: { anchor: "applyIntent" },
  exported: { query: "applyIntent", label: "applyIntent", anchor: "applyIntent" },
  elsewhere: [{ query: "controlLimits", group: "charts · API index", label: "controlLimits", address: "/charts/api/#controlLimits" }],
  /* The day above the plot, a group's lane count and its fold button. What
     the readout speaks once a key rests is proven in German by
     `tests-unit/readout.test.tsx`. */
  language: {
    pageId: "lane-groups",
    texts: [
      ["Tuesday, 17 March 2026", "Dienstag, 17. März 2026"],
      ["2 lanes", "2 Bahnen"],
    ],
    buttons: [["Fold group: Developers", "Gruppe einklappen: Developers"]],
  },
});
