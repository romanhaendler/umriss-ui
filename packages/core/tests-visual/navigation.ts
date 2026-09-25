/* How a test gets to a page or an example.

   Through the address, as a person does too. The address comes out of the
   demo's outline and not out of a second list here: a page that moves there
   moves here with it. The waiting stands with the shell (`@umriss-ui/demo`),
   because it waits on it.

   The outline import still names the German module of `demo/`; that directory
   is renamed by its own ticket. */

import { navigation } from "@umriss-ui/demo/checks/navigation";
import { addressOf } from "../demo/outline";

export { OUTLINE, ALL_PAGES, addressOf } from "../demo/outline";
export { allWithCode, settle, standstill } from "@umriss-ui/demo/checks/navigation";

export const { open, openExample, openScenario } = navigation(addressOf);
