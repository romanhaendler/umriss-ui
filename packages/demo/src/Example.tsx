/* An example: the running thing and its source, at an address.

   The demonstration is the same component with a different appearance - wider,
   last, and labelled as such. Two implementations of the same thing would be
   two places where the copy button can break.

   Two controls, and they mean different things. Whoever skims wants the
   examples as a gallery; whoever has found the right one wants every block
   open without clicking five times. The toggle in the page head serves both.
   That is why the state here is not simply copied: the toggle sets the
   default, collapsing a single block sets an exception to it, and a new state
   of the toggle clears the exceptions again. Otherwise a block would hang open
   after "all closed" that nobody sees any more.

   The copy button copies exactly what stands there - the same string that is
   coloured. It lives in `CopyButton.tsx`, because the import line in the page
   head needs the same one.

   An example that shows a file beside itself gets tabs, and Copy takes the one
   in front: two tabs mean two things to copy, and a button that always copied
   the first would be a lie on the second. An example showing nothing - which
   is nearly all of them - has no tab bar at all. */

import { useMemo, useState } from "react";
import { highlight } from "sugar-high";
import { CopyButton } from "./CopyButton";
import type { Example as ExampleData, ExampleFile } from "./tooling/examples";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 10 10" width="9" height="9" aria-hidden="true" data-open={open ? "" : undefined}>
      <path
        d="M3.5 1.5 7 5l-3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CodeBlock({ files }: { files: readonly ExampleFile[] }) {
  const [shown, setShown] = useState(0);
  const front = files[Math.min(shown, files.length - 1)]!;
  const highlighted = useMemo(() => highlight(front.source), [front.source]);
  return (
    <div className="codeBlock">
      <div className="codeBar">
        {files.length > 1 ? (
          <span className="codeTabs" role="tablist">
            {files.map((file, index) => (
              <button
                key={file.name}
                type="button"
                role="tab"
                className="codeTab"
                aria-selected={file === front}
                onClick={() => setShown(index)}
              >
                {file.name}
              </button>
            ))}
          </span>
        ) : (
          <span className="codeLanguage">tsx</span>
        )}
        <CopyButton text={front.source} />
      </div>
      {/* The source comes from our own directory and from a highlighter that
          only puts marks around it - no input from outside. */}
      <pre className="code">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

export interface ExampleProps {
  example: ExampleData;
  /** The state of the page toggle - the default, not the last word. */
  allOpen: boolean;
}

export function Example({ example, allOpen }: ExampleProps) {
  const [exception, setException] = useState<boolean | null>(null);
  /* A new state of the toggle clears the exceptions: it is the statement for
     the whole page and not a suggestion per block.

     It is caught up during rendering and not in an effect. An effect would run
     only after painting, and the reader would see the old state for one frame -
     React names exactly this case as the one this pattern exists for. */
  const [lastToggle, setLastToggle] = useState(allOpen);
  if (lastToggle !== allOpen) {
    setLastToggle(allOpen);
    setException(null);
  }
  const open = (lastToggle === allOpen ? exception : null) ?? allOpen;

  const headId = `example-${example.pageId}-${example.id}`;
  const codeId = `${headId}-code`;

  return (
    <section
      className="example"
      data-example={example.id}
      data-demonstration={example.demonstration ? "" : undefined}
      id={`${example.pageId}/${example.id}`}
      aria-labelledby={headId}
    >
      <header className="exampleHead">
        <h3 className="exampleTitle" id={headId}>
          {example.title}
        </h3>
        {example.demonstration && <span className="exampleMark">Demonstration</span>}
        <button
          type="button"
          className="exampleToggle"
          aria-expanded={open}
          aria-controls={codeId}
          onClick={() => setException(!open)}
        >
          <Chevron open={open} />
          Code
        </button>
      </header>

      <div className="exampleStage">
        <example.Component />
      </div>

      <div className="exampleCode" id={codeId} hidden={!open}>
        {/* Render it only once it is visible: forty highlighted blocks on one
            page, none of them open, are forty trees for nothing. */}
        {open && <CodeBlock files={example.files} />}
      </div>
    </section>
  );
}
