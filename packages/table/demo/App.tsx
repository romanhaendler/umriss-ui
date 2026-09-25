/* The application around the shell: the theme and nothing else - as in the demo
   of @umriss-ui/core. The shell itself is the same one (`@umriss-ui/demo`). */

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
  }, [theme]);

  return [theme, setTheme];
}

export function App() {
  const [theme, setTheme] = useTheme();

  return (
    <Shell
      demo={DEMO}
      brand="Umriss Table"
      version={manifest.version}
      sentence="Tables for data-dense applications, where people search, filter, total and act on many rows: columns declared as elements and typed against their rows. Four screens from four worlds, each built from the pages in the sidebar."
      actions={
        <Button size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </Button>
      }
    />
  );
}
