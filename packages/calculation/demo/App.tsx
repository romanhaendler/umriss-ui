/* The application around the shell: what makes this demo a particular one,
   handed over - as in the other demos. The shell itself is the same one
   (`@umriss-ui/demo`), theme included. */

import { Shell } from "@umriss-ui/demo";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { DEMO } from "./examples";

/* The German pair, from the subpath an application imports it from: the
   header's EN/DE switch renders every example and scenario in it. */
const GERMAN = { wording: GERMAN_WORDING, formats: GERMAN_FORMATS };

export function App() {
  return (
    <Shell
      demo={DEMO}
      german={GERMAN}
      sentence="A calculation shows how a figure on a data-dense screen came about - an availability, a price, an invoice total - evaluated by the library and read line by line down to the numbers it started from, so the working cannot disagree with the result. Below, screens in which a reader checks a number before acting on it."
    />
  );
}
