/* One page, checked against this demo: code toggle, page toggle, copy button.
   The tests stand with the shell (`@umriss-ui/demo/checks/page.ts`). */

import { checkPage } from "@umriss-ui/demo/checks/page";
import { open, openExample } from "./navigation";

checkPage({
  open,
  openExample,
  pageId: "schedule",
  examples: ["first-schedule", "many-lanes", "operating-calendar"],
  other: { name: "Lane", pageId: "lane" },
  packageName: "@umriss-ui/schedule",
  importLine: 'import { Schedule, Lane, Subtasks, Transports } from "@umriss-ui/schedule";',
});
