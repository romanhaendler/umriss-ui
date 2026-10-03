/* The application around the shell: what makes this demo a particular one,
   handed over - as in the demo of @umriss-ui/core. The shell itself is the
   same one (`@umriss-ui/demo`), theme included. */

import { Shell } from "@umriss-ui/demo";
import { DEMO } from "./examples";

export function App() {
  return (
    <Shell
      demo={DEMO}
      sentence="Tables for data-dense applications, where people search, filter, total and act on many rows: columns declared as elements and typed against their rows. Four screens from four worlds, each built from the pages in the sidebar."
    />
  );
}
