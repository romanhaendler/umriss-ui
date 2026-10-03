/* The scenarios page - the front door of every demo.

   Composed, realistic screens, each in a world of its own (CONTEXT.md,
   "Scenario"), after Polaris's patterns: titled by the user's job, one
   sentence on who uses the screen, the live screen with numbered marks, the
   marks explained below, the pages it is built from, the code collapsed.

   The worlds (`worlds/`). A world has a fixed moment; a feed's freshness
   counts from page load. Alarms, acknowledgements, tasks and readings keep the
   world's moment; only the `asOf` handed to a component that judges freshness
   (AlarmList, Stat, Given) is the moment the page was loaded, less the feed's
   plausible delay - so no screen ages into a stale or lost feed while the site
   stands. An example whose subject is a stale or lost feed shows it relative
   to load as well. Each demo's smoke test loads its scenarios under a clock in
   2030 to hold this.

   The marks. A screen names a spot with `data-callout="1"` on any element; the
   stage lays a numbered badge just outside the element's corner, above and
   to the left - on the corner itself it had covered a label's first letter. Laid over, not put
   in: an attribute is harmless in copied code, a badge element would not be.
   The positions are measured, and measured again whenever the stage changes
   size. */

import { useLayoutEffect, useRef, useState } from "react";
import { CodeBlock } from "./Example";
import { hrefOf, hrefOfNeighbour } from "./href";
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
    /* A mark stays on the stage: a spot scrolled out of its box - a table's
       last column on a phone - gets its mark at the stage's edge, pointing
       the way, and not beyond it, where it had pushed the page sideways. */
    const measure = () => {
      const origin = host.getBoundingClientRect();
      const found = [...host.querySelectorAll<HTMLElement>("[data-callout]")].map((el) => {
        const box = el.getBoundingClientRect();
        return {
          n: el.dataset.callout ?? "",
          left: Math.min(Math.max(box.left - origin.left, 0), origin.width),
          top: Math.min(Math.max(box.top - origin.top, 0), origin.height),
        };
      });
      setMarks((old) => (JSON.stringify(old) === JSON.stringify(found) ? old : found));
    };
    measure();
    /* A spot moves when a box inside the screen scrolls, too. */
    host.addEventListener("scroll", measure, true);
    /* jsdom has no ResizeObserver; the smoke tests render without it. */
    if (typeof ResizeObserver === "undefined") return () => host.removeEventListener("scroll", measure, true);
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => {
      host.removeEventListener("scroll", measure, true);
      observer.disconnect();
    };
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
    return { name: entry.name, href: hrefOfNeighbour(packageName, pageId) };
  }
  const page = demo.addresses.ALL_PAGES.find((one) => one.id === entry);
  return { name: page?.name ?? entry, href: hrefOf(demo.addresses.addressOf(entry)) };
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
        {open && <CodeBlock name={scenario.title} source={scenario.source} />}
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
