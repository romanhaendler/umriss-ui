/* How a test reaches a page or an example: through the address, the way a human
   does too. The address comes from the demo's outline; the waiting stands with
   the shell (`@umriss-ui/demo`), because it is the shell it waits for. */

import { navigation } from "@umriss-ui/demo/checks/navigation";
import { addressOf } from "../demo/outline";

export { OUTLINE, ALL_PAGES, addressOf } from "../demo/outline";
export { allWithCode, settle, standstill } from "@umriss-ui/demo/checks/navigation";

export const { open, openExample } = navigation(addressOf);
