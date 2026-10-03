/* The application around the shell: what makes this demo a particular one,
   handed over - as in the demo of @umriss-ui/core. The shell itself is the
   same one (`@umriss-ui/demo`), theme included. */

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
      sentence="Tables for data-dense applications, where people search, filter, total and act on many rows: columns declared as elements and typed against their rows. Four screens from four worlds, each built from the pages in the sidebar."
    />
  );
}
