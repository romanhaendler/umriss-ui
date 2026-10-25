/* The charts under a finger: no target on any page is smaller than 24 x 24 px
   (WCAG 2.5.8, ADR-0070). The suite stands with the shell
   (`@umriss-ui/demo/checks/floor`). */

import { checkTargetFloor } from "@umriss-ui/demo/checks/floor";
import { EXAMPLE_ADDRESSES } from "./pages";
import { open } from "./navigation";

checkTargetFloor({ demo: "charts", open, examples: EXAMPLE_ADDRESSES });
