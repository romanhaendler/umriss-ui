/* Charts with `touch-scale.css` under a finger: no md control is clipped or overflows its container
   (ADR-0079). The suite stands with the shell (`@umriss-ui/demo/checks/touchScale`). */

import { checkTouchScale } from "@umriss-ui/demo/checks/touchScale";
import { EXAMPLE_ADDRESSES } from "./pages";
import { open } from "./navigation";

checkTouchScale({ open, examples: EXAMPLE_ADDRESSES });
