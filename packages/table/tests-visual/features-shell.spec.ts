/* The shell, checked against this demo. The tests stand once, with the shell
   (`@umriss-ui/demo/checks/shell.ts`), and run against all three demos; here stand
   the pages and queries they can be checked against in @umriss-ui/table. */

import { checkShell } from "@umriss-ui/demo/checks/shell";

checkShell({
  packageId: "table",
  notOnTheFrontDoor: ["first-table", "toolbar"],
  scenario: "find-a-late-shipment",
  pinnedScenario: "find-a-late-shipment",
  rail: { name: "AlarmList", pageId: "alarmlist", rubricId: "limits-and-alarms" },
  low: { name: "AlarmList", pageId: "alarmlist" },
  neighbours: [
    { name: "Pagination", pageId: "pagination" },
    { name: "Virtualisation", pageId: "virtualisation" },
  ],
  deepLink: { pageId: "columnmenu", absent: "first-table" },
  example: { pageId: "row-appearance", id: "states", title: "Show loading, empty, failed and no match", pageName: "Row appearance" },
  palettePage: { query: "verdictcolumn", name: "VerdictColumn", pageId: "verdictcolumn", rubricName: "Limits and alarms" },
  abbreviation: { query: "vc", find: "VerdictColumn", glyphs: ["V", "C"] },
  /* The wide query finds many, the narrow one fewer, and the find under the
     pointer (`Toolbar`) is no longer among them - were it, the palette would
     rightly keep it, and the test would be checking something else. Not
     "tab" since every group begins with "table ·" (one-search 02): "tab"
     finds every entry of this demo through its group. */
  pointer: { wide: "ta", narrow: "tag" },
  moved: { from: "table", pageId: "first-table", example: "first-table" },
  contents: { pageId: "toolbar", id: "place-it-outside", title: "Place it outside the table" },
  foldedRow: { pageId: "first-table", id: "TableProps-onCellEdit" },
  synonyms: [{ query: "frozen", name: "Width and pinning", pageId: "width-and-pinning" }],
  elsewhere: [{ query: "select", group: "core · Choosing", label: "Select", address: "/core/select/" }],
  prop: { query: "pageSize", label: "pageSize", group: "table · TableOptions", pageId: "first-table", id: "TableOptions-pageSize" },
  /* The States example's empty body, where a search matches nothing, and the
     due dates of the Styling rows example. */
  language: {
    pageId: "row-appearance",
    texts: [
      ["Nothing matches the search and filters", "Nichts passt zu Suche und Filtern"],
      ["15/04/2026", "15.04.2026"],
    ],
    buttons: [["Clear input", "Eingabe leeren"]],
  },
});
