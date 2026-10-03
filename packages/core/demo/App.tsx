/* The application around the shell: what makes this demo a particular one,
   handed over. The theme is the shell's (`ThemeSwitch.tsx`), one for all five.

   It was once called `Showcase`. That word stands on the avoid list of
   CONTEXT.md under "Scenario", and it no longer fitted either:
   everything that used to stand here - twenty-one surfaces, their state and
   their layers - now stands in `demo/examples/`, one file per example. The
   file IS the example: what runs is exactly what the reader sees. */

import { Shell } from "@umriss-ui/demo";
import { DEMO } from "./examples";

export function App() {
  return (
    <Shell
      demo={DEMO}
      sentence="Whole screens of data-dense applications, built from these components as a product would ship them. Each is named after the job it serves, and its numbered marks point to the parts that do the work."
    />
  );
}
