/* The rubric line of a page head, and at its end "Copy page"
   (.scratch/pages-as-markdown, 03).

   For a reader who hands one page to a coding agent: the main action copies
   the page's Markdown twin - the very file the site serves beside the page -
   and the menu opens that file, or a conversation with Claude or ChatGPT that
   already points at it. No backend: the twin is a static file, and the two
   assistants take the prompt in their address.

   It is core's `SplitButton` and `Menu`, and that is the shell's second
   exception to plain elements (the first is the palette, `Shell.tsx`): the
   documentation shows the library at work where a reader uses it.

   It stands on the rubric line so that it is on every page, the scenarios
   page included, and moves nothing: the line keeps the height of the rubric's
   words (`page.css`, `.pageCopy`).

   The label says "Copied" for the time the copy button says it; a label
   change is not reliably announced, so the word goes into a status region
   too. */

import { MenuItem, SplitButton } from "@umriss-ui/core";
import { useCopy } from "./CopyButton";
import type { Demo } from "./demo";
import { hrefOf } from "./href";
import { twinOfPlace } from "./outline";

export interface RubricLineProps {
  demo: Demo;
  /** The rubric's name, or "Scenarios". */
  rubric: string;
  /** The page's place (`/select`), `""` for the scenarios page. */
  place: string;
  /** What the prompt calls the page: its name, or "the scenarios". */
  name: string;
}

export function RubricLine({ demo, rubric, place, name }: RubricLineProps) {
  const [state, copy] = useCopy();
  const twin = hrefOf(twinOfPlace(place));
  const word = state === "copied" ? "Copied" : state === "failed" ? "Failed" : "";

  /* The text is fetched inside the clipboard's own call: Safari keeps the
     click's permission only for a write that starts in the click. */
  const writeTwin = () => {
    const text = fetch(twin).then((response) => {
      if (!response.ok) throw new Error(`${twin}: ${response.status}`);
      return response.blob();
    });
    return typeof ClipboardItem === "undefined"
      ? text.then((blob) => blob.text()).then((value) => navigator.clipboard.writeText(value))
      : navigator.clipboard.write([new ClipboardItem({ "text/plain": text.then((blob) => new Blob([blob], { type: "text/plain" })) })]);
  };

  const openTab = (url: string) => window.open(url, "_blank", "noopener");
  const ask = (assistant: string) => {
    const address = new URL(twin, window.location.href).href;
    openTab(
      assistant +
        encodeURIComponent(
          `Read ${address} — the documentation of ${name} in ${demo.packageName}@${demo.version}. Then help me use it in my React app.`,
        ),
    );
  };

  return (
    <div className="pageRubricLine">
      <p className="pageRubric">{rubric}</p>
      <div className="pageCopy">
        <SplitButton
          size="sm"
          variant="plain"
          onClick={() => void copy(writeTwin)}
          menuLabel="More ways to use this page"
          menu={
            <>
              <MenuItem onSelect={() => openTab(twin)}>View as Markdown</MenuItem>
              <MenuItem onSelect={() => ask("https://claude.ai/new?q=")}>Open in Claude</MenuItem>
              <MenuItem onSelect={() => ask("https://chatgpt.com/?hints=search&q=")}>Open in ChatGPT</MenuItem>
            </>
          }
        >
          {word === "" ? "Copy page" : word}
        </SplitButton>
        <span role="status" className="pageCopyStatus">
          {word}
        </span>
      </div>
    </div>
  );
}
