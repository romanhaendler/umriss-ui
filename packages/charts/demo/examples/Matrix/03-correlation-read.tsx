import { Tooltip, useChart } from "../../../src";

/* Data from the data scientist's world, written out here so the example runs on its own. */
/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const VARIABLES = ["Age", "Income", "Tenure", "Visits", "Basket", "Returns", "Support", "Churn", "Score"] as const;

interface Pair {
  /** The column: the variable's place in `VARIABLES`. */
  column: number;
  /** The row: the variable's name. */
  variable: string;
  /** Their correlation, from -1 to 1. */
  r: number;
}

/** The correlations of nine variables: the cosine between direction vectors in
    a small space, which is a valid correlation matrix by construction. */
const CORRELATIONS: readonly Pair[] = (() => {
  const draw = random(11);
  const vectors = VARIABLES.map(() => [draw() - 0.45, draw() - 0.5, draw() - 0.5]);
  const unit = vectors.map((v) => {
    const length = Math.hypot(...v);
    return v.map((c) => c / length);
  });
  const pairs: Pair[] = [];
  VARIABLES.forEach((variable, row) => {
    VARIABLES.forEach((_, column) => {
      const dot = (unit[row] as number[]).reduce((sum, c, k) => sum + c * (unit[column] as number[])[k]!, 0);
      pairs.push({ column, variable, r: Math.round(Math.max(-1, Math.min(1, dot)) * 100) / 100 });
    });
  });
  return pairs;
})();

/** Nine stops from blue through white to red, one per ninth of [-1, 1]. */
const DIVERGING = ["#2166ac", "#4393c3", "#92c5de", "#d1e5f0", "#f7f7f7", "#fddbc7", "#f4a582", "#d6604d", "#b2182b"];

interface Load {
  hour: number;
  service: string;
  /** The share of capacity in use, 0 to 1. */
  load: number;
}

/** A load per service and hour: dense on purpose, 24 columns of nine rows. */
const LOAD: readonly Load[] = (() => {
  const draw = random(5);
  const cells: Load[] = [];
  VARIABLES.forEach((service) => {
    for (let hour = 0; hour < 24; hour++) cells.push({ hour, service, load: Math.round(draw() * 100) / 100 });
  });
  return cells;
})();

export const title = "A correlation matrix, read";
export const lead =
  "With `labels` each cell writes its level in the matrix' `format`, in the text colour over a halo of the ground colour, so it reads on the lightest and the darkest stop alike. A cell too small for its text is left without one: the second matrix is dense, and where the chart is narrow its cells stay bare - the tooltip still names every one.";

export default function CorrelationRead() {
  const first = useChart(CORRELATIONS);
  const second = useChart(LOAD);
  return (
    <>
      <first.Chart height={380} aria-label="Correlation of nine variables, each cell written out">
        <first.XAxis value="column" ticks={VARIABLES.map((_, k) => k)} tickFormat={(v) => VARIABLES[v] ?? ""} />
        <first.YAxis />
        <first.Matrix
          value="variable"
          level="r"
          coloring={{ kind: "gradient", stops: DIVERGING, range: [-1, 1] }}
          name="Correlation"
          format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          labels
        />
        <Tooltip mode="nearest" />
      </first.Chart>
      <second.Chart height={300} aria-label="Load per service and hour, labels where the cells have room">
        <second.XAxis value="hour" ticks={[0, 6, 12, 18]} tickFormat={(v) => `${v}:00`} label="Hour" />
        <second.YAxis />
        <second.Matrix value="service" level="load" name="Load" labels />
        <Tooltip mode="nearest" />
      </second.Chart>
    </>
  );
}
