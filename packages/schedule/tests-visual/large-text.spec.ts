/* The schedule with the root font size at 200 % (text-at-double-size). The suite
   stands with the shell (`@umriss-ui/demo/checks/largeText`). */

import { checkLargeText } from "@umriss-ui/demo/checks/largeText";
import { EXAMPLE_ADDRESSES } from "./pages";
import { open } from "./navigation";

checkLargeText({ demo: "schedule", open, examples: EXAMPLE_ADDRESSES });
