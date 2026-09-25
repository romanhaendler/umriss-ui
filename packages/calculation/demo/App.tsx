/* The application around the shell: the theme and nothing else - as in the
   other demos. The shell itself is the same one (`@umriss-ui/demo`). */

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
       The tokens follow it. */
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return [theme, setTheme];
}

export function App() {
  const [theme, setTheme] = useTheme();

  return (
    <Shell
      demo={DEMO}
      brand="Umriss Calculation"
      version={manifest.version}
      sentence="A calculation shows how a figure on a data-dense screen came about - an availability, a price, an invoice total - evaluated by the library and read line by line down to the numbers it started from, so the working cannot disagree with the result. Below, screens in which a reader checks a number before acting on it."
      actions={
        <Button size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </Button>
      }
    />
  );
}
