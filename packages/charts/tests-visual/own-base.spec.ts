/* Every example against what a component must carry itself (ADR-0021). The
   checks stand with the shell (`@umriss-ui/demo/checks/ownBase.ts`). */

import { checkOwnBase } from "@umriss-ui/demo/checks/ownBase";
import { open } from "./navigation";
import { PAGES } from "./pages";

checkOwnBase({
  open,
  pages: PAGES.filter((pageId) => pageId !== "overview"),
  tolerated: {
    "benchmark \u203a button \"1,000 points\"":
      "The benchmark's own controls and result list - plain markup of the demo around the measurement, not a part of @umriss-ui/charts.",
    "benchmark \u203a button \"1,000,000 points\"":
      "The benchmark's own controls and result list - plain markup of the demo around the measurement, not a part of @umriss-ui/charts.",
    "benchmark \u203a button \"100,000 points\"":
      "The benchmark's own controls and result list - plain markup of the demo around the measurement, not a part of @umriss-ui/charts.",
    "benchmark \u203a button \"Live\"":
      "The benchmark's own controls and result list - plain markup of the demo around the measurement, not a part of @umriss-ui/charts.",
    "benchmark \u203a button \"Mixed\"":
      "The benchmark's own controls and result list - plain markup of the demo around the measurement, not a part of @umriss-ui/charts.",
    "benchmark \u203a dt \"FPS (hover)\"":
      "The benchmark's own controls and result list - plain markup of the demo around the measurement, not a part of @umriss-ui/charts.",
    "benchmark \u203a dt \"Materialisation\"":
      "The benchmark's own controls and result list - plain markup of the demo around the measurement, not a part of @umriss-ui/charts.",
    "benchmark \u203a dt \"Points\"":
      "The benchmark's own controls and result list - plain markup of the demo around the measurement, not a part of @umriss-ui/charts.",
    "benchmark \u203a dt \"Series draw\"":
      "The benchmark's own controls and result list - plain markup of the demo around the measurement, not a part of @umriss-ui/charts.",
    "sizes \u203a button \"Collapse\"":
      "The example's own control to collapse the chart - markup of the demo, not a part of @umriss-ui/charts, which ships no buttons.",
  },
});
