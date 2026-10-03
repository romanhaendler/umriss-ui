/* The application around the shell: what makes this demo a particular one,
   handed over - as in the demos of @umriss-ui/core and @umriss-ui/table. The
   shell itself is the same one (`@umriss-ui/demo`, ADR-0020), theme included;
   what used to stand here was a second implementation of it, a thousand lines
   long. */

import { Shell } from "@umriss-ui/demo";
import { DEMO } from "./examples";

export function App() {
  return (
    <Shell
      demo={DEMO}
      sentence="Charts for data-dense applications: series, states and limits on shared axes, the marks on canvas and every label a reader has to read in the DOM. Each screen below is one a product could ship, built from them."
    />
  );
}
