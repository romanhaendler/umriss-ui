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
      brand="Umriss Schedule"
      version={manifest.version}
      sentence="Work on lanes over time, for the screens where people plan who does what and when: rotas, tours, sprints. Each scenario below is a screen as an application would ship it, with its dependencies, blocked time and findings, and the code that builds it."
    />
  );
}
