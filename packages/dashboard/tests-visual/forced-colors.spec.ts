/* The dashboard under forced colours – the Windows contrast mode, emulated. The
   suite stands with the shell (`@umriss-ui/demo/checks/forcedColors.ts`). */

import { checkForcedColours } from "@umriss-ui/demo/checks/forcedColors";
import { EXAMPLE_ADDRESSES, SAMPLE } from "./pages";
import { open, openExample } from "./navigation";

checkForcedColours({ open, openExample, examples: EXAMPLE_ADDRESSES, sample: SAMPLE });
