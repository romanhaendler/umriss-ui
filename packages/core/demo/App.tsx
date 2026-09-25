/* The application around the shell: the theme and nothing else.

   It was once called `Showcase`. That word stands on the avoid list of
   CONTEXT.md under "Scenario", and it no longer fitted either:
   everything that used to stand here - twenty-one surfaces, their state and
   their layers - now stands in `demo/examples/`, one file per example. The
   file IS the example: what runs is exactly what the reader sees. */

import { useEffect, useState } from "react";
import { Shell } from "@umriss-ui/demo";
import { Button } from "../src";
import { DEMO } from "./examples";
/* The number in the header is the one in the manifest - a literal here had
   fallen a version behind before anybody saw it. */
import manifest from "../package.json";

type Theme = "light" | "dark";

function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );

  useEffect(() => {
    /* The way an application switches its mode: `color-scheme` on the root.
       The tokens follow it through light-dark() (ADR-0021) - there is no
       attribute of the library to set beside it. */
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return [theme, setTheme];
}

export function App() {
  const [theme, setTheme] = useTheme();

  return (
    <Shell
      demo={DEMO}
      brand="Umriss UI"
      version={manifest.version}
      sentence="Whole screens of data-dense applications, built from these components as a product would ship them. Each is named after the job it serves, and its numbered marks point to the parts that do the work."
      actions={
        <Button size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </Button>
      }
    />
  );
}
