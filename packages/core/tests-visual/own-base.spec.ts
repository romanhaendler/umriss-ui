/* Every example against what a component must carry itself (ADR-0021). The
   checks stand with the shell (`@umriss-ui/demo/checks/ownBase.ts`). */

import { checkOwnBase } from "@umriss-ui/demo/checks/ownBase";
import { open } from "./navigation";
import { PAGES } from "./pages";

checkOwnBase({
  open,
  pages: PAGES.filter((pageId) => pageId !== "scenarios"),
  tolerated: {
    "shortcut › input":
      "The palette's field carries no ring on purpose: the pane is the focus indicator (checked in packages/demo/checks/shell.ts, 'the field carries no focus ring').",
    /* The slider's ring stands on its thumb, a pseudo-element of the range
       input the probe does not read; features-basics.spec.ts reads it there.
       One entry per example that has a slider. */
    ...Object.fromEntries(
      ["a-setpoint", "format-and-marks", "controlled-with-a-field", "mixing-station", "machine-settings", "a-plant-browser"].map(
        (example) => [
          `${example} › input.range`,
          "The slider's ring stands on its thumb (::-webkit-slider-thumb), which the probe cannot read; features-basics.spec.ts checks it there.",
        ],
      ),
    ),
  },
});
