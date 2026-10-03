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
      sentence="Work on lanes over time, for the screens where people plan who does what and when: rotas, tours, sprints. Each scenario below is a screen as an application would ship it, with its dependencies, blocked time and findings, and the code that builds it."
    />
  );
}
