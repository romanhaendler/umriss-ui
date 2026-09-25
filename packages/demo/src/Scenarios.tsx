/* The scenarios page - the front door of every demo.

   Composed, realistic screens, each in a world of its own (CONTEXT.md,
   "Scenario"), after Polaris's patterns: titled by the user's job, one
   sentence on who uses the screen, the live screen with numbered marks, the
   marks explained below, the pages it is built from, the code collapsed.

   The marks. A screen names a spot with `data-callout="1"` on any element; the
   stage lays a numbered badge over the element's corner. Laid over, not put
   in: an attribute is harmless in copied code, a badge element would not be.
   The positions are measured, and measured again whenever the stage changes
   size. */

import { useLayoutEffect, useRef, useState } from "react";
import { CodeBlock } from "./Example";
import { Prose } from "./Prose";
import type { Demo } from "./demo";
import type { ForeignPage, Scenario } from "./tooling/examples";

interface Mark {
  n: string;
  left: number;
  top: number;
}

function Stage({ scenario }: { scenario: Scenario }) {
  const stage = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<readonly Mark[]>([]);

  useLayoutEffect(() => {
    const host = stage.current;
    if (host === null) return;
    const measure = () => {
      const origin = host.getBoundingClientRect();
      const found = [...host.querySelectorAll<HTMLElement>("[data-callout]")].map((el) => {
        const box = el.getBoundingClientRect();
        return { n: el.dataset.callout ?? "", left: box.left - origin.left, top: box.top - origin.top };
      });
      setMarks((old) => (JSON.stringify(old) === JSON.stringify(found) ? old : found));
    };
    measure();
    /* jsdom has no ResizeObserver; the smoke tests render without it. */
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="scenarioStage" ref={stage}>
      <scenario.Component />
      {marks.map((mark) => (
        <span key={mark.n} className="calloutMark" aria-hidden="true" style={{ left: mark.left, top: mark.top }}>
          {mark.n}
        </span>
      ))}
    </div>
  );
}

function linkOf(entry: string | ForeignPage, demo: Demo): { name: string; href: string } {
  if (typeof entry !== "string") {
    const [packageName, pageId] = entry.page.split("#") as [string, string];
    /* The site keeps each demo in a directory named after its package
       (scripts/build-pages.mjs). */
    return { name: entry.name, href: `../${packageName.split("/")[1]}/#/${pageId}` };
  }
  const page = demo.addresses.ALL_PAGES.find((one) => one.id === entry);
  return { name: page?.name ?? entry, href: `#/${entry}` };
}

function ScenarioBlock({ scenario, demo }: { scenario: Scenario; demo: Demo }) {
  const [open, setOpen] = useState(false);
  const headId = `scenario-${scenario.id}`;
  return (
    <section className="scenario" data-scenario={scenario.id} aria-labelledby={headId}>
      <h2 className="scenarioTitle" id={headId}>
        {scenario.title}
      </h2>
      <p className="scenarioLead">
        <Prose text={scenario.lead} />
      </p>
      <Stage scenario={scenario} />
      {scenario.callouts.length > 0 && (
        <ol className="callouts">
          {scenario.callouts.map((text) => (
            <li key={text}>
              <Prose text={text} />
            </li>
          ))}
        </ol>
      )}
      <p className="builtFrom">
        <span className="builtFromLabel">Built from</span>{" "}
        {scenario.builtFrom.map((entry, i) => {
          const { name, href } = linkOf(entry, demo);
          return (
            <span key={href}>
              {i > 0 && ", "}
              <a href={href}>{name}</a>
            </span>
          );
        })}
      </p>
      <button
        type="button"
        className="exampleToggle"
        aria-expanded={open}
        aria-controls={`${headId}-code`}
        onClick={() => setOpen(!open)}
      >
        Code
      </button>
      <div className="exampleCode" id={`${headId}-code`} hidden={!open}>
        {open && <CodeBlock files={scenario.files} />}
      </div>
    </section>
  );
}

export function Scenarios({ demo, brand, sentence }: { demo: Demo; brand: string; sentence: string }) {
  return (
    <article className="page scenarios" data-block="scenarios" aria-labelledby="scenarios-title">
      <header className="pageHead">
        <p className="pageRubric">{brand}</p>
        <h1 className="pageName" id="scenarios-title">
          Scenarios
        </h1>
        <p className="pageSentence">{sentence}</p>
      </header>
      {demo.scenarios.length === 0 ? (
        <p className="pageEmpty">There is no scenario for this demo yet. The pages in the sidebar show every component.</p>
      ) : (
        demo.scenarios.map((scenario) => <ScenarioBlock key={scenario.id} scenario={scenario} demo={demo} />)
      )}
    </article>
  );
}
