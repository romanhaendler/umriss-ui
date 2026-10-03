/* The theme of the whole site: one choice, light or dark, for all five demos
   and the front page.

   The way an application switches its mode: `color-scheme` on the root. The
   tokens follow it through light-dark() (ADR-0021) - there is no attribute of
   the library to set beside it. Nor an `invalidateTheme()` for the charts:
   they cache their resolved colours, and charts' theme observer on the root
   notices this very style change and has them read anew.

   The choice is stored under one key, which every demo and the front page
   read - the site is one origin. With nothing stored the theme follows the
   system, live; the first press stores it from then on. There is no third
   "system" state: removing the key restores it, and a third state costs a menu
   for a choice almost nobody makes. Storage can throw (a private window,
   blocked site data); then the switch works for the visit and nothing is
   remembered.

   The theme must stand before the first paint, so each demo's `index.html`
   carries a short script in its head that reads the same key and sets the same
   style. It and this module know the key, and the shell suite checks them
   together; the front page (`scripts/front-page.html`) takes the same script
   and repeats this switch in a few lines of its own, since it has no bundle. */

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const KEY = "umriss-ui:theme";
const SYSTEM_DARK = "(prefers-color-scheme: dark)";

function storedTheme(): Theme | undefined {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : undefined;
  } catch {
    return undefined;
  }
}

function systemTheme(): Theme {
  return window.matchMedia(SYSTEM_DARK).matches ? "dark" : "light";
}

function useTheme(): [Theme, () => void] {
  const [chosen, setChosen] = useState(storedTheme);
  const [system, setSystem] = useState(systemTheme);

  useEffect(() => {
    const query = window.matchMedia(SYSTEM_DARK);
    const follow = () => setSystem(query.matches ? "dark" : "light");
    query.addEventListener("change", follow);
    return () => query.removeEventListener("change", follow);
  }, []);

  const theme = chosen ?? system;

  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* Blocked: the choice lasts for the visit. */
    }
    setChosen(next);
  };

  return [theme, toggle];
}

/** The header's theme button: a moon that leads into the dark, a sun out of
    it, and named by what a press does. */
export function ThemeSwitch() {
  const [theme, toggle] = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button type="button" className="shellTheme" aria-label={`Switch to ${next} theme`} onClick={toggle}>
      {next === "dark" ? (
        <svg viewBox="0 0 10 10" width="16" height="16" aria-hidden="true">
          <path
            d="M5 1.2a2.5 2.5 0 0 0 3.8 3.8A3.8 3.8 0 1 1 5 1.2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 10 10" width="16" height="16" aria-hidden="true">
          {/* The rays are strokes of no length: a round cap alone is a dot. */}
          <path
            d="M5 3a2 2 0 1 0 0 4 2 2 0 1 0 0-4ZM5 .7v0M5 9.3v0M.7 5h0M9.3 5h0M1.96 1.96h0M8.04 8.04h0M1.96 8.04h0M8.04 1.96h0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
