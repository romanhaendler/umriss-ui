/* The application around the shell: what makes this demo a particular one,
   handed over - as in the other demos. The shell itself is the same one
   (`@umriss-ui/demo`), theme included. */

import { Shell } from "@umriss-ui/demo";
import { DEMO } from "./examples";
/* The number in the header is the one in the manifest. */
import manifest from "../package.json";

export function App() {
  return (
    <Shell
      demo={DEMO}
      brand="Umriss Calculation"
      version={manifest.version}
      sentence="A calculation shows how a figure on a data-dense screen came about - an availability, a price, an invoice total - evaluated by the library and read line by line down to the numbers it started from, so the working cannot disagree with the result. Below, screens in which a reader checks a number before acting on it."
    />
  );
}
