/* The application around the shell: the theme and nothing else - as in the
   other three demos. The shell itself is the same one (`@umriss-ui/demo`). */

import { useEffect, useState } from "react";
import { Button } from "@umriss-ui/core";
import { Shell } from "@umriss-ui/demo";
import { DEMO } from "./examples";
/* The number in the header is the one in the manifest. */
import manifest from "../package.json";

type Theme = "light" | "dark";

function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );

  useEffect(() => {
    /* The way an application switches its mode: `color-scheme` on the root.
       The canvas reads its colours anew through charts' theme observer. */
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return [theme, setTheme];
}

export function App() {
  const [theme, setTheme] = useTheme();

  return (
    <Shell
      demo={DEMO}
      brand="Umriss Schedule"
      version={manifest.version}
      title="How work moves through the plant"
      sentence="The parts of @umriss-ui/schedule with the code that produces them: subtasks on lanes over time, transports between them, findings that are drawn and never resolved, and editing that reports intents instead of changing data. Every page shows running examples together with their source, and the props tables generated from it."
      actions={
        <Button size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </Button>
      }
    />
  );
}
