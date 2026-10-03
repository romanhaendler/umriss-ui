/* The application around the shell: what makes this demo a particular one,
   handed over. The theme is the shell's (`ThemeSwitch.tsx`), one for all five.

   It was once called `Showcase`. That word stands on the avoid list of
   CONTEXT.md under "Scenario", and it no longer fitted either:
   everything that used to stand here - twenty-one surfaces, their state and
   their layers - now stands in `demo/examples/`, one file per example. The
   file IS the example: what runs is exactly what the reader sees. */

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
      sentence="Whole screens of data-dense applications, built from these components as a product would ship them. Each is named after the job it serves, and its numbered marks point to the parts that do the work."
    />
  );
}
