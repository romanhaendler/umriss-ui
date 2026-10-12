/* What a large virtualised tree costs, measured from outside: the first render,
   a walk of the Active node with the arrow keys, and a scroll. Nothing here is
   a prop of the tree. Not photographed: it measures the moment it runs.

   The scripted runs start from a button and are driven by the page itself, so
   a person and a script read the same figures. `data-role` names every control
   and every figure; `status` reads idle, running or done.

   What a figure covers: script, React's commit and a forced layout - the
   clock stops after two macrotasks and a layout read, not at the paint, so
   that frame quantisation does not enter the figure. */

import { useCallback, useEffect, useRef, useState } from "react";
import { TreeView, useTree } from "../../../src";
import type { NodeReader } from "../../../src";

export const title = "Measure a large tree";
export const lead = "Set a node count and press the buttons: the first render, a walk down the tree with the arrow keys and a scroll are timed in this browser.";

interface Unit {
  id: string;
  name: string;
  children?: Unit[];
}

const SIZES = [10_000, 50_000, 100_000] as const;
const ROW = 26;
const KEYS = 200;
const SCROLLS = 100;
/* Rows per scroll step: far enough to replace the window every time. */
const SCROLL_ROWS = 10;

/** A forest of folders (6 groups of 7 leaves each, 49 nodes per root) cut off at
    `count` nodes; every folder is open, so the visible rows are the nodes. */
function build(count: number): { roots: Unit[]; open: string[] } {
  const roots: Unit[] = [];
  const open: string[] = [];
  let made = 0;
  const node = (id: string, children?: Unit[]): Unit => ({ id, name: `Node ${id}`, children });
  for (let r = 0; made < count; r++) {
    const groups: Unit[] = [];
    open.push(`r${r}`);
    made++;
    for (let g = 0; g < 6 && made < count; g++) {
      const leaves: Unit[] = [];
      made++;
      open.push(`r${r}-${g}`);
      for (let l = 0; l < 7 && made < count; l++) {
        leaves.push(node(`r${r}-${g}-${l}`));
        made++;
      }
      groups.push(node(`r${r}-${g}`, leaves));
    }
    roots.push(node(`r${r}`, groups));
  }
  return { roots, open };
}

const READER: NodeReader<Unit> = {
  key: (unit) => unit.id,
  children: (unit) => unit.children,
  label: (unit) => unit.name,
};

type Status = "idle" | "running" | "done";
type Figures = { firstRender: number | null; perKey: number | null; perScroll: number | null };

/** Two macrotasks, then a layout read: React has committed by then. */
function settled(): Promise<void> {
  const tick = () =>
    new Promise<void>((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => resolve();
      channel.port2.postMessage(null);
    });
  return tick()
    .then(tick)
    .then(() => void document.body.offsetHeight);
}

function Body({ built, onShown }: { built: { roots: Unit[]; open: string[] }; onShown: () => void }) {
  const tree = useTree(built.roots, {
    reader: READER,
    defaultExpanded: built.open,
    defaultActive: built.roots[0]?.id ?? null,
    virtual: { rowHeight: ROW },
  });
  useEffect(onShown, [onShown]);
  return (
    <TreeView tree={tree} ariaLabel="Benchmark tree" style={{ height: 320 }}>
      {(entry) => entry.node.name}
    </TreeView>
  );
}

/** The clock, behind a function so that it is read in handlers only. */
const now = () => performance.now();

const show = (ms: number | null) => (ms === null ? "-" : ms.toFixed(2));

export default function Benchmark() {
  const [size, setSize] = useState<(typeof SIZES)[number]>(SIZES[0]);
  const [built, setBuilt] = useState(() => build(SIZES[0]));
  const [status, setStatus] = useState<Status>("idle");
  const [figures, setFigures] = useState<Figures>({ firstRender: null, perKey: null, perScroll: null });
  const [run, setRun] = useState(0);
  const started = useRef<number | null>(null);
  const host = useRef<HTMLDivElement>(null);

  const choose = (n: (typeof SIZES)[number]) => {
    if (status === "running") return;
    const next = build(n);
    setStatus("running");
    setFigures({ firstRender: null, perKey: null, perScroll: null });
    started.current = now();
    setSize(n);
    setBuilt(next);
    setRun((r) => r + 1);
  };

  /* Stable between renders: the body's effect runs on mount only, which is
     the first render of a run (the body is keyed by the run, so the
     same size again renders anew). */
  const onShown = useCallback(() => {
    const from = started.current;
    if (from === null) return;
    started.current = null;
    void settled().then(() => {
      setFigures((f) => ({ ...f, firstRender: performance.now() - from }));
      setStatus("done");
    });
  }, []);

  const tree = () => host.current?.querySelector<HTMLElement>('[role="tree"]') ?? null;

  const walk = async () => {
    const root = tree();
    const active = root?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]');
    if (status === "running" || !root || !active) return;
    setStatus("running");
    active.focus();
    await settled();
    let total = 0;
    for (let i = 0; i < KEYS; i++) {
      const target = document.activeElement ?? root;
      const from = performance.now();
      target.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
      await settled();
      total += performance.now() - from;
    }
    setFigures((f) => ({ ...f, perKey: total / KEYS }));
    setStatus("done");
  };

  const scroll = async () => {
    const root = tree();
    if (status === "running" || !root) return;
    setStatus("running");
    root.scrollTop = 0;
    await settled();
    let from = 0;
    /* A capture listener on the window runs before React's own at the root, so
       the clock starts as the scroll event is dispatched. */
    const start = () => {
      from = performance.now();
    };
    window.addEventListener("scroll", start, { capture: true });
    let total = 0;
    for (let i = 0; i < SCROLLS; i++) {
      /* A step that moves nothing fires no event; the run goes on after a
         moment instead of waiting for one that never comes. */
      const fired = new Promise<void>((resolve) => {
        root.addEventListener("scroll", () => resolve(), { once: true });
        setTimeout(resolve, 500);
      });
      from = performance.now();
      root.scrollTop += SCROLL_ROWS * ROW;
      await fired;
      await settled();
      total += performance.now() - from;
    }
    window.removeEventListener("scroll", start, { capture: true });
    setFigures((f) => ({ ...f, perScroll: total / SCROLLS }));
    setStatus("done");
  };

  return (
    <>
      <div className="demo-actions">
        {SIZES.map((n) => (
          <button key={n} className="demo-button" data-role={`size-${n}`} aria-pressed={n === size} onClick={() => choose(n)}>
            {n.toLocaleString("en-US")} nodes
          </button>
        ))}
        <button className="demo-button" data-role="walk" onClick={walk}>
          Walk {KEYS} keys
        </button>
        <button className="demo-button" data-role="scroll" onClick={scroll}>
          Scroll {SCROLLS} steps
        </button>
      </div>
      <dl className="metrics">
        <div>
          <dt>Status</dt>
          <dd data-role="status">{status}</dd>
        </div>
        <div>
          <dt>Nodes</dt>
          <dd data-role="nodes">{size}</dd>
        </div>
        <div>
          <dt>First render (ms)</dt>
          <dd data-role="first-render">{show(figures.firstRender)}</dd>
        </div>
        <div>
          <dt>Per key (ms)</dt>
          <dd data-role="per-key">{show(figures.perKey)}</dd>
        </div>
        <div>
          <dt>Per scroll event (ms)</dt>
          <dd data-role="per-scroll">{show(figures.perScroll)}</dd>
        </div>
      </dl>
      <div ref={host}>
        <Body key={run} built={built} onShown={onShown} />
      </div>
    </>
  );
}
