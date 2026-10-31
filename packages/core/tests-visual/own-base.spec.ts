/* Every example against what a component must carry itself (ADR-0021). The
   checks stand with the shell (`@umriss-ui/demo/checks/ownBase.ts`). */

import { checkOwnBase } from "@umriss-ui/demo/checks/ownBase";
import { open } from "./navigation";
import { PAGES } from "./pages";

checkOwnBase({
  open,
  /* The API index carries no example. */
  pages: PAGES.filter((pageId) => pageId !== "scenarios" && pageId !== "api"),
  tolerated: {
    "shortcut › input":
      "The palette's field carries no ring on purpose: the pane is the focus indicator (checked in packages/demo/checks/shell.ts, 'the field carries no focus ring').",
    "reveal-a-secret › input.inner":
      "The ring stands on the frame, and Tab moves on to the key inside the same frame: the probe sees the frame ringed before and after.",
    /* The slider's ring stands on its thumb, a pseudo-element of the range
       input the probe does not read; features-basics.spec.ts reads it there.
       One entry per example that has a slider. */
    ...Object.fromEntries(
      ["canary-traffic", "units-and-marks", "set-roughly-then-exactly", "split-a-budget", "browse-down-and-back-up", "long-settings-in-sections"].map(
        (example) => [
          `${example} › input.range`,
          "The slider's ring stands on its thumb (::-webkit-slider-thumb), which the probe cannot read; features-basics.spec.ts checks it there.",
        ],
      ),
    ),
    /* The range slider's two thumbs wear the slider's ring the same way. */
    ...Object.fromEntries(
      ["an-acceptable-band", "units-and-the-state", "in-a-form"].map((example) => [
        `${example} › input.thumb`,
        "The ring stands on the thumb (::-webkit-slider-thumb), which the probe cannot read; it is the slider's own.",
      ]),
    ),
  },
});
