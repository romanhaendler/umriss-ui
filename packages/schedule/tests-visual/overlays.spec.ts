/* Nothing the schedule draws in the DOM is in its own way (ADR-0021's
   neighbour in spirit: what a component draws, it is answerable for). The
   check stands with the shell (`@umriss-ui/demo/checks/overlays.ts`); here
   stand the pages it walks. */

import { checkOverlays } from "@umriss-ui/demo/checks/overlays";
import { open } from "./navigation";
import { PAGES } from "./pages";

checkOverlays({
  open,
  pages: PAGES.filter((pageId) => pageId !== "scenarios"),
});
