/* What the table costs, measured from outside with the clock: the first render,
   a scroll step, a sort, a search keystroke, a page turned, a group folded, a
   column hidden and a re-render of the caller with nothing changed. The page
   adds nothing to the table. Not photographed: it measures the moment it runs.

   A figure is the synchronous time of `flushSync` around the change - render,
   commit and layout effects, not the paint. Every change but the scroll is the
   median of five runs; the scroll is the mean over a scripted scroll, timed to
   the change of the rows in the DOM because the table renders it outside
   `flushSync`. A
   production build has no React profiler, so the clock is the only instrument.

   The page is driven by a script as well as by hand: every control and every
   figure carries a `data-role`, and `status` reads idle, running or done. */

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Badge, Button, Stack, Text } from "@umriss-ui/core";
import { Pagination, Search, Toolbar, useTable } from "../../../src";

export const title = "Measure two hundred thousand rows";
export const lead = "Load up to 200 000 rows and run a change: the times say what rendering, scrolling, sorting, searching, paging, folding and hiding cost here.";

interface Request {
  id: string;
  service: string;
  status: 200 | 404 | 500;
  duration: number;
  size: number;
  region: string;
}

const SERVICES = ["Checkout", "Billing", "Sign-in", "Search", "Image service", "Notifications", "Webhooks", "Reporting"] as const;
const REGIONS = ["eu-west", "eu-central", "us-east", "ap-south"] as const;
const STATUSES = [200, 200, 200, 200, 200, 200, 404, 500] as const;
const TONE = { 200: "success", 404: "warning", 500: "danger" } as const;

/* A linear congruential generator: the same rows on every run. */
function generate(count: number): Request[] {
  let seed = 20260317;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  return Array.from({ length: count }, (_, i) => ({
    id: `REQ-${String(i + 1).padStart(6, "0")}`,
    service: SERVICES[Math.floor(next() * SERVICES.length)]!,
    status: STATUSES[Math.floor(next() * STATUSES.length)]!,
    duration: Math.round(20 + next() * 900),
    size: Math.round(next() * 5000) / 10,
    region: REGIONS[Math.floor(next() * REGIONS.length)]!,
  }));
}

/** `virtual`: a virtualised table with a footer aggregate. `grouped`: the same,
    grouped by service with share bars. `paged`: pages instead of a window, the
    only mode in which a page can be turned. */
type Mode = "virtual" | "grouped" | "paged";

const SIZES = [10_000, 50_000, 200_000] as const;
const MODES: readonly Mode[] = ["virtual", "grouped", "paged"];

/* The table under measurement. `tick` is not read: a new value only makes the
   caller render this component again, with the accessors below written inline
   as the examples write them. */
function Measured({ rows, mode, onTable }: { rows: Request[]; mode: Mode; tick: number; onTable: (t: Handle) => void }) {
  const t = useTable(rows, {
    rowKey: (r) => r.id,
    virtual: mode !== "paged",
    pageSize: 50,
    defaultGrouping: mode === "grouped" ? "service" : undefined,
  });
  onTable(t);
  const { Table, Column } = t;
  return (
    <Table maxHeight="340px" stickyHeader ariaLabel="Requests">
      <Toolbar>
        <Search placeholder="Request or service" />
      </Toolbar>
      <Column value="id" label="Request" rowHeader width={130} />
      <Column value="service" label="Service" width={140} />
      <Column value="status" label="Status" width={100}>
        {(status) => <Badge tone={TONE[status]}>{status}</Badge>}
      </Column>
      <Column value="duration" label="Duration (ms)" width={130} aggregate="sum" />
      {/* A computed column, its function written inline: a new one on every
          render of the caller, which is what the re-render figure is about. */}
      <Column id="size" value={(r) => r.size} label="Size (kB)" format={{ decimals: 1 }} width={110} aggregate="sum" />
      <Column value="region" label="Region" width={120} />
      {mode === "paged" ? <Pagination /> : null}
    </Table>
  );
}

/** The calls the measurements make on the table. */
interface Handle {
  toggleSort: (column: string) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  foldAll: () => void;
  unfoldAll: () => void;
  toggleColumn: (column: string) => void;
}

const FIGURES = ["first-render", "scroll", "sort", "search", "page", "fold", "hide", "rerender"] as const;
type Figure = (typeof FIGURES)[number];
type Status = "idle" | "running" | "done";

const REPEATS = 5;
const SCROLL_STEPS = 60;
const QUERIES = ["eu", "web", "500", "pay", "us-"];

const timed = (change: () => void): number => {
  const start = performance.now();
  flushSync(change);
  return performance.now() - start;
};
const median = (values: number[]): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!;
/* Lets the browser paint "running" before a measurement blocks the thread, and
   settles what a change left behind. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 50));

export default function Benchmark() {
  const [load, setLoad] = useState<{ rows: Request[]; mode: Mode; key: number }>({ rows: [], mode: "virtual", key: 0 });
  const [tick, setTick] = useState(0);
  const [count, setCount] = useState(String(SIZES[0]));
  const [status, setStatus] = useState<Status>("idle");
  const [figures, setFigures] = useState<Partial<Record<Figure, string>>>({});
  const table = useRef<Handle | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const generated = useRef<Request[]>([]);

  /* A figure that does not apply in this mode reads "-". */
  const show = (figure: Figure, ms: number | null) =>
    setFigures((f) => ({ ...f, [figure]: ms === null ? "-" : ms.toFixed(1) }));

  const run = async (body: () => Promise<void> | void) => {
    flushSync(() => setStatus("running"));
    await settle();
    try {
      await body();
    } finally {
      setStatus("done");
    }
  };

  const open = (n: number, mode: Mode) =>
    run(async () => {
      if (generated.current.length !== n) generated.current = generate(n);
      const rows = generated.current;
      /* The previous table goes first, so the figure is a mount and no more. */
      flushSync(() => setLoad({ rows: [], mode, key: load.key + 1 }));
      await settle();
      show("first-render", timed(() => setLoad({ rows, mode, key: load.key + 2 })));
    });

  /* `change` is timed, `restore` is not; both run synchronously. */
  const repeat = (figure: Figure, applies: boolean, change: (i: number) => void, restore?: () => void) =>
    run(async () => {
      if (!applies || table.current === null) return show(figure, null);
      const times: number[] = [];
      for (let i = 0; i < REPEATS; i++) {
        times.push(timed(() => change(i)));
        if (restore) flushSync(restore);
        await settle();
      }
      show(figure, median(times));
    });

  /* The scroll area is the table's parent, the element that carries the
     table's `onScroll`. */
  const scroller = (): HTMLElement | null => host.current?.querySelector("table")?.parentElement ?? null;

  /* Each step moves the scroll position and then sends the scroll event inside
     the timing: the event reaches the table's handler the same way the browser's
     own, which comes a frame later, does. */
  const measureScroll = () =>
    run(async () => {
      const el = scroller();
      if (el === null || mode === "paged") return show("scroll", null);
      el.scrollTop = 0;
      await settle();
      let total = 0;
      for (let i = 0; i < SCROLL_STEPS; i++) {
        const start = performance.now();
        await new Promise<void>((resolve) => {
          const rows = new MutationObserver(() => {
            rows.disconnect();
            resolve();
          });
          rows.observe(el, { childList: true, subtree: true });
          el.scrollTop += 600;
          el.dispatchEvent(new Event("scroll"));
          setTimeout(() => {
            rows.disconnect();
            resolve();
          }, 1000);
        });
        total += performance.now() - start;
        /* The browser's own scroll event follows a frame later and finds the
           window already in place. */
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      show("scroll", total / SCROLL_STEPS);
    });

  const t = () => table.current!;
  const mode = load.mode;

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center" wrap>
        {SIZES.map((n) => (
          <Button
            key={n}
            size="sm"
            data-role={`rows-${n}`}
            onClick={() => {
              setCount(String(n));
              void open(n, mode);
            }}
          >
            {n.toLocaleString("en-US")} rows
          </Button>
        ))}
        <input
          type="number"
          min={1}
          max={200_000}
          aria-label="Row count"
          data-role="rows-input"
          value={count}
          onChange={(event) => setCount(event.target.value)}
        />
        <Button size="sm" data-role="load" onClick={() => void open(Math.min(200_000, Math.max(1, Number(count) || 1)), mode)}>
          Load
        </Button>
        {MODES.map((m) => (
          <Button
            key={m}
            size="sm"
            data-role={`mode-${m}`}
            aria-pressed={mode === m}
            onClick={() => void open(generated.current.length || SIZES[0], m)}
          >
            {m}
          </Button>
        ))}
      </Stack>
      <Stack direction="row" gap={2} align="center" wrap>
        <Button size="sm" data-role="measure-scroll" onClick={() => void measureScroll()}>Scroll</Button>
        <Button size="sm" data-role="measure-sort" onClick={() => void repeat("sort", true, () => t().toggleSort("duration"))}>Sort</Button>
        <Button
          size="sm"
          data-role="measure-search"
          onClick={() => void repeat("search", true, (i) => t().setSearch(QUERIES[i % QUERIES.length]!), () => t().setSearch(""))}
        >
          Search
        </Button>
        <Button size="sm" data-role="measure-page" onClick={() => void repeat("page", mode === "paged", (i) => t().setPage(2 + i), () => t().setPage(1))}>
          Page
        </Button>
        <Button size="sm" data-role="measure-fold" onClick={() => void repeat("fold", mode === "grouped", () => t().foldAll(), () => t().unfoldAll())}>
          Fold
        </Button>
        <Button size="sm" data-role="measure-hide" onClick={() => void repeat("hide", true, () => t().toggleColumn("region"), () => t().toggleColumn("region"))}>
          Hide column
        </Button>
        <Button size="sm" data-role="measure-rerender" onClick={() => void repeat("rerender", true, () => setTick((n) => n + 1))}>Re-render</Button>
      </Stack>
      <dl style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", margin: 0 }}>
        <div>
          <Text as="dt">Status</Text>
          <Text as="dd" mono style={{ margin: 0 }} data-role="status">{status}</Text>
        </div>
        <div>
          <Text as="dt">Rows</Text>
          <Text as="dd" mono style={{ margin: 0 }} data-role="rows">{load.rows.length}</Text>
        </div>
        {FIGURES.map((f) => (
          <div key={f}>
            <Text as="dt">{f} (ms)</Text>
            <Text as="dd" mono style={{ margin: 0 }} data-role={f}>{figures[f] ?? "-"}</Text>
          </div>
        ))}
      </dl>
      <div ref={host}>
        {load.rows.length > 0 ? (
          <Measured
            key={`${mode}-${load.key}`}
            rows={load.rows}
            mode={mode}
            tick={tick}
            onTable={(handle) => {
              table.current = handle;
            }}
          />
        ) : null}
      </div>
    </Stack>
  );
}
