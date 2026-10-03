/* An example: the running thing and its source, at an address.

   Its lead - one sentence, the situation and the prop - stands visible above
   it: the skimmer is the reader who needs it, and a code comment inside a
   collapsed block never reaches them. The first example of a page stands
   without a heading, right under the page head: the component at rest. It
   has no head row either - a bar holding one small word was the first thing a
   visitor saw. Its "Code" toggle stands in a slim foot under the stage, after
   it in the tab order as on the screen, and its title names the section.

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

   It is one file, and copied alone it runs: the example's data stands in it
   (`checks/ownData`). */

import { useMemo, useState } from "react";
import { highlight } from "sugar-high";
import { CopyButton } from "./CopyButton";
import { Prose } from "./Prose";
import type { Example as ExampleData } from "./tooling/examples";

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

export function CodeBlock({ name, source }: { name: string; source: string }) {
  const highlighted = useMemo(() => highlight(source), [source]);
  return (
    <div className="codeBlock">
      <div className="codeBar">
        <span className="codeLanguage">tsx</span>
        <CopyButton text={source} />
      </div>
      {/* The source comes from our own directory and from a highlighter that
          only puts marks around it - no input from outside. A long line scrolls
          the block sideways, so the keyboard has to reach it too. */}
      <pre className="code" tabIndex={0} aria-label={`Source of ${name}`}>
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

export interface ExampleProps {
  example: ExampleData;
  /** The state of the page toggle - the default, not the last word. */
  allOpen: boolean;
  /** The first example: no heading, its title only as the section's name. */
  hero?: boolean;
}

export function Example({ example, allOpen, hero = false }: ExampleProps) {
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
  const toggle = (
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
  );

  return (
    <section
      className="example"
      data-example={example.id}
      data-hero={hero ? "" : undefined}
      id={`${example.pageId}/${example.id}`}
      aria-labelledby={hero ? undefined : headId}
      aria-label={hero ? example.title : undefined}
    >
      {!hero && (
        <header className="exampleHead">
          <h3 className="exampleTitle" id={headId}>
            {example.title}
          </h3>
          {toggle}
        </header>
      )}

      {example.lead !== undefined && (
        <p className="exampleLead">
          <Prose text={example.lead} />
        </p>
      )}

      <div className="exampleStage">
        <example.Component />
      </div>

      {hero && <div className="exampleFoot">{toggle}</div>}

      <div className="exampleCode" id={codeId} hidden={!open}>
        {/* Render it only once it is visible: forty highlighted blocks on one
            page, none of them open, are forty trees for nothing. */}
        {open && <CodeBlock name={example.title} source={example.source} />}
      </div>
    </section>
  );
}
