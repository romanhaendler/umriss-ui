/* The shell, checked against this demo. The tests stand once, with the shell
   (`@umriss-ui/demo/checks/shell.ts`); here stand the pages and queries they
   can be checked against in @umriss-ui/calculation. */

import { checkShell } from "@umriss-ui/demo/checks/shell";

checkShell({
  packageId: "calculation",
  notOnTheFrontDoor: ["tree", "chain"],
  scenario: "price-a-tour",
  rail: { name: "Metrics", pageId: "metrics", rubricId: "writing" },
  low: { name: "Worked examples", pageId: "worked-examples" },
  neighbours: [
    { name: "Tree", pageId: "tree" },
    { name: "Chain", pageId: "chain" },
  ],
  deepLink: { pageId: "given", absent: "tree" },
  example: { pageId: "chain", id: "payslip", title: "Fold a group of lines into one", pageName: "Chain" },
  palettePage: { query: "metrics", name: "Metrics", pageId: "metrics", rubricName: "Writing a calculation" },
  abbreviation: { query: "wcgw", find: "What can go wrong", glyphs: ["W", "c", "g", "w"] },
  pointer: { wide: "ta", narrow: "tab" },
  contents: { pageId: "chain", id: "payslip", title: "Fold a group of lines into one" },
});
