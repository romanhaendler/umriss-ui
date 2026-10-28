/* The opt-in `touch-scale.css` of core, switched on from the header so the
   grown state can be looked at (ADR-0079). It is on when the address carries
   `?touch-scale`, which is how a test opens a page with it.

   The stylesheet is core's own, put on the page as a `<style>` element for as
   long as the switch is on. It acts under `(pointer: coarse)` only, as it does
   in an application: from a desk the switch shows its effect under touch
   emulation, and the hint says so. */

import { useEffect, useState } from "react";
import touchScale from "./touch-scale.css?inline";

const HINT = "Touch scale: md controls are 44 px under a coarse pointer (touch emulation)";

export function TouchScaleSwitch() {
  const [on, setOn] = useState(() => new URLSearchParams(window.location.search).has("touch-scale"));

  useEffect(() => {
    if (!on) return;
    const style = document.createElement("style");
    style.textContent = touchScale;
    style.dataset.touchScale = "";
    document.head.append(style);
    return () => style.remove();
  }, [on]);

  return (
    <button
      type="button"
      className="shellTheme"
      aria-label="Touch scale"
      aria-pressed={on}
      title={HINT}
      onClick={() => setOn(!on)}
    >
      <svg viewBox="0 0 10 10" width="16" height="16" aria-hidden="true">
        <path
          d="M5 3.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 1 0 0-2.8ZM5 .8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 1 0 0-8.4Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    </button>
  );
}
