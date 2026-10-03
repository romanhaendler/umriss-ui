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
   A stage narrower than 640 px has no room around its elements - a phone's
   screen fills it edge to edge, and a mark outside a corner lay on the title
   above. There the stage keeps a gutter at its left, one mark wide, and each
   mark stands in it, level with its element's top edge.
   The positions are measured, and measured again whenever the stage changes
   size. */

import { useLayoutEffect, useRef, useState } from "react";
import { CodeBlock, CodeToggle } from "./Example";
import { useContents } from "./Contents";
import { hrefOf, hrefOfNeighbour } from "./href";
import { PACKAGES } from "./packages";
import { InstallLine, PageTurn } from "./Page";
import { Prose } from "./Prose";
import type { Demo } from "./demo";
import { SCENARIOS } from "./outline";
import type { ForeignPage, Scenario } from "./tooling/examples";

interface Mark {
  n: string;
  left: number;
  top: number;
}

/** Below this stage width the marks move into a gutter at the left. */
const NARROW = 640;
/** A mark's height and its ring (`.calloutMark`), and a pixel between two. */
const MARK_STEP = 25;

function Stage({ scenario }: { scenario: Scenario }) {
  const stage = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<readonly Mark[]>([]);
  const [narrow, setNarrow] = useState(false);

  useLayoutEffect(() => {
    const host = stage.current;
    if (host === null) return;
    /* A mark stays on the stage: a spot scrolled out of its box - a table's
       last column on a phone - gets its mark at the stage's edge, pointing
       the way, and not beyond it, where it had pushed the page sideways. */
    const measure = () => {
      const origin = host.getBoundingClientRect();
      const inGutter = origin.width < NARROW;
      setNarrow(inGutter);
      const found = [...host.querySelectorAll<HTMLElement>("[data-callout]")].map((el) => {
        const box = el.getBoundingClientRect();
        return {
          n: el.dataset.callout ?? "",
          left: Math.min(Math.max(box.left - origin.left, 0), origin.width),
          top: Math.min(Math.max(box.top - origin.top, 0), origin.height),
        };
      });
      /* In the gutter, two spots on one line - a search and a column menu in
         one toolbar - would share a place: the higher number steps down. */
      if (inGutter) {
        found.sort((a, b) => a.top - b.top || Number(a.n) - Number(b.n));
        for (let i = 1; i < found.length; i++) found[i]!.top = Math.max(found[i]!.top, found[i - 1]!.top + MARK_STEP);
      }
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
    <div className="scenarioStage" ref={stage} data-narrow={narrow ? "" : undefined}>
      <scenario.Component />
      {marks.map((mark) => (
        <span key={mark.n} className="calloutMark" aria-hidden="true" style={{ left: narrow ? undefined : mark.left, top: mark.top }}>
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
      <CodeToggle open={open} controls={`${headId}-code`} onToggle={() => setOpen(!open)} />
      <div className="exampleCode" id={`${headId}-code`} hidden={!open}>
        {open && <CodeBlock name={scenario.title} source={scenario.source} />}
      </div>
    </section>
  );
}

/* The landing's head names the package, not the page: a reader arriving here
   learns which of the five this is, how to install it and where to begin. The
   page to begin with comes from the one list of packages. */
export function Scenarios({ demo, sentence }: { demo: Demo; sentence: string }) {
  const startId = PACKAGES.find((one) => one.npm === demo.packageName)?.start;
  const start = demo.addresses.ALL_PAGES.find((one) => one.id === startId);
  const contents = useContents([
    { label: demo.packageName, href: hrefOf(demo.addresses.addressOf(SCENARIOS)), target: "#scenarios-title" },
    ...demo.scenarios.map((scenario) => ({
      label: scenario.title,
      href: hrefOf(demo.addresses.addressOf(SCENARIOS, scenario.id)),
      target: `[data-scenario="${scenario.id}"]`,
    })),
  ]);
  return (
    <article className="page scenarios" data-block="scenarios" aria-labelledby="scenarios-title">
      <header className="pageHead">
        <p className="pageRubric">Scenarios</p>
        <h1 className="pageName" id="scenarios-title" tabIndex={-1}>
          {demo.packageName}
        </h1>
        <p className="pageSentence">{sentence}</p>
        <InstallLine command={demo.install} />
        {start !== undefined && (
          <p className="pageStart">
            <a href={hrefOf(demo.addresses.addressOf(start.id))}>Start with {start.name} →</a>
          </p>
        )}
      </header>
      {contents.disclosure}
      {demo.scenarios.length === 0 ? (
        <p className="pageEmpty">There is no scenario for this demo yet. The pages in the sidebar show every component.</p>
      ) : (
        demo.scenarios.map((scenario) => <ScenarioBlock key={scenario.id} scenario={scenario} demo={demo} />)
      )}
      <PageTurn demo={demo} />
      {contents.column}
    </article>
  );
}
