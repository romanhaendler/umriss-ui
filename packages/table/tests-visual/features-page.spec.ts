/* One page, checked against this demo: code toggle, page toggle, copy button.
   The tests stand with the shell (`@umriss-ui/demo/checks/page.ts`) and run
   against every demo that uses the shell. */

import { checkFirstExample, checkInstall, checkPage } from "@umriss-ui/demo/checks/page";
import { ALL_PAGES, open, openExample } from "./navigation";

checkInstall({ open, pages: ALL_PAGES, command: "npm install @umriss-ui/table @umriss-ui/core" });

checkFirstExample({ open, pageId: "manual-mode", title: "Hand the table one page" });

checkPage({
  open,
  openExample,
  pageId: "manual-mode",
  examples: ["only-pages", "sort-and-search", "filter-options"],
  other: { name: "Column", pageId: "column" },
  packageName: "@umriss-ui/table",
  importLine: 'import { useTable } from "@umriss-ui/table";',
  limits: "manual-mode",
});
