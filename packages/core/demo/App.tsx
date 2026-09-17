/* The application around the shell: the theme and nothing else.

   It was once called `Showcase`. That word stands on the avoid list of
   CONTEXT.md under "Demonstration", and it no longer fitted either:
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
      title="The components, with the code that makes them"
      sentence="Living documentation of every component: each page shows running examples together with their source, and the complete props table, generated from the source code. Every colour and every spacing comes from the design tokens - the demo allows itself nothing the library does not give it."
      actions={
        <Button size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </Button>
      }
    />
  );
}
