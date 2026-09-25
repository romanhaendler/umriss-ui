/* The application around the shell: the theme and nothing else - as in the
   demos of @umriss-ui/core and @umriss-ui/table. The shell itself is the same
   one (`@umriss-ui/demo`, ADR-0020); what used to stand here was a second
   implementation of it, a thousand lines long. */

import { useEffect, useState } from "react";
import { Button } from "@umriss-ui/core";
import { Shell } from "@umriss-ui/demo";
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
    /* No `invalidateTheme()` beside it: the charts cache their resolved
       colours, and the theme module's observer on the root notices this very
       style change and has them read anew. The explicit call stays public for a
       switch made on another ancestor. */
  }, [theme]);

  return [theme, setTheme];
}

export function App() {
  const [theme, setTheme] = useTheme();

  return (
    <Shell
      demo={DEMO}
      brand="Umriss Charts"
      version={manifest.version}
      sentence="The parts of @umriss-ui/charts with the code that produces them: series as elements on shared axes, canvas for the marks and DOM for everything a reader has to read. Every page shows running examples together with their source, and the props tables generated from it. All data are seed-based and identical across runs."
      actions={
        <Button size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </Button>
      }
    />
  );
}
