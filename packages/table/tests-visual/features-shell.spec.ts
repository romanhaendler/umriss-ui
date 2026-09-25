/* The shell, checked against this demo. The tests stand once, with the shell
   (`@umriss-ui/demo/checks/shell.ts`), and run against all three demos; here stand
   the pages and queries they can be checked against in @umriss-ui/table. */

import { checkShell } from "@umriss-ui/demo/checks/shell";

checkShell({
  notOnTheFrontDoor: ["table", "toolbar"],
  scenario: "find-a-late-shipment",
  rail: { name: "AlarmList", pageId: "alarmlist", rubricId: "limits-and-alarms" },
  neighbours: [
    { name: "Toolbar", pageId: "toolbar" },
    { name: "Search", pageId: "search" },
  ],
  deepLink: { pageId: "columnmenu", absent: "table" },
  example: { pageId: "table", id: "states", title: "Show loading, empty, failed and no match", pageName: "Table" },
  palettePage: { query: "verdictcolumn", name: "VerdictColumn", pageId: "verdictcolumn", rubricName: "Limits and alarms" },
  abbreviation: { query: "vc", find: "VerdictColumn", glyphs: ["V", "C"] },
  /* Twenty-seven finds become eleven, and the find under the pointer is no
     longer among them. With "tabelle" it would still be - the palette would
     then keep it rightly, and the test would be checking something else. */
  pointer: { wide: "ta", narrow: "row" },
});
