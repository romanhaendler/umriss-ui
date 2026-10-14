/* The application around the shell: what makes this demo a particular one,
   handed over - as in the other demos. The shell itself is the same one
   (`@umriss-ui/demo`), theme included. */

import { Shell } from "@umriss-ui/demo";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { DEMO } from "./examples";

const GERMAN = { wording: GERMAN_WORDING, formats: GERMAN_FORMATS };

export function App() {
  return (
    <Shell
      demo={DEMO}
      german={GERMAN}
      sentence="A dashboard shows the figures, trends and lists a reader looks at first, in an arrangement the application chose for their role, packed on twelve columns and the same on every screen wide enough for them."
    />
  );
}
