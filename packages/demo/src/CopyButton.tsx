/* The copy button - one of them, in two places.

   The import line in the page head and every code block have the same button,
   and it was once written twice: the same 1600 ms twice, the same class twice,
   but the state attribute only once. The line in the head therefore stayed
   silent when the copying succeeded, and the rule for it in `page.css` ran
   into nothing.

   That same fault had reappeared in a second form and is repaired here: the
   component wrote `data-state` while the stylesheet still selected
   `data-stand`, so the copied and failed states had no styling at all. An
   attribute and its selector move together or not at all.

   When it fails it says so on itself and does not throw into the page: over
   http, inside a frame, or after a refusal there is no clipboard. A demo that
   goes white while copying has documented worse than one that could not copy
   at all. */

import { useEffect, useState } from "react";

type CopyState = "settle" | "copied" | "failed";

const RESET_AFTER = 1600;

export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<CopyState>("settle");

  useEffect(() => {
    if (state === "settle") return;
    const t = window.setTimeout(() => setState("settle"), RESET_AFTER);
    return () => window.clearTimeout(t);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <button type="button" className="codeCopy" onClick={() => void copy()} data-state={state}>
      {state === "settle" ? "Copy" : state === "copied" ? "Copied" : "Failed"}
    </button>
  );
}
