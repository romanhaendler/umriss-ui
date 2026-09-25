/* The shell, checked against this demo. The tests stand once, with the shell
   (`@umriss-ui/demo/checks/shell.ts`), and run against every demo; here stand
   the pages and queries they can be checked against in @umriss-ui/schedule. */

import { checkShell } from "@umriss-ui/demo/checks/shell";

checkShell({
  notOnTheFrontDoor: ["schedule", "move-and-lane"],
  scenario: "replan-the-day",
  rail: { name: "Transports", pageId: "transports", rubricId: "drawing" },
  neighbours: [
    { name: "Lanes", pageId: "lane" },
    { name: "Subtasks", pageId: "subtasks" },
  ],
  deepLink: { pageId: "findings", absent: "schedule" },
  example: { pageId: "transports", id: "late-transport", title: "A transport that cannot arrive in time", pageName: "Transports" },
  palettePage: { query: "ripple", name: "Ripple", pageId: "ripple", rubricName: "Editing" },
  abbreviation: { query: "sbt", find: "Subtasks", glyphs: ["S", "bt"] },
  pointer: { wide: "s", narrow: "late" },
});
