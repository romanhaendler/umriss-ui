import { Tooltip, useChart } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */

/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface Load {
  hour: number;
  /** Processor load, in per cent. */
  cpu: number;
}

/** A day of hourly load per service: busy by day, each at a level of its own. */
const SERVICES = ["Checkout", "Billing", "Sign-in", "Search", "Image service", "Notifications"].map((name, index) => {
  const r = random(40 + index);
  const level = 25 + index * 11;
  const rows: Load[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    cpu: Math.min(100, Math.round(level * (0.5 + 0.5 * Math.max(0, Math.sin((Math.PI * (hour - 5)) / 16))) + r() * 8)),
  }));
  return { name, rows };
});

export const title = "Small multiples on one y domain";
export const lead = "Six charts share a `syncId` and the same `domain` on every `YAxis`. Equal domains give equal tick labels, so the y bands are equally wide and the plot areas line up; axes that fit their own data would start each plot at another x. Which domain is common is the application's decision, not a prop.";

function Small({ name, rows }: { name: string; rows: readonly Load[] }) {
  const { Chart, XAxis, YAxis, Line } = useChart(rows);
  return (
    <Chart height={140} syncId="services" aria-label={`${name}, processor load over a day`}>
      <XAxis value="hour" tickCount={4} />
      <YAxis domain={[0, 100]} tickCount={3} label={`${name} %`} />
      <Line value="cpu" name={name} />
      <Tooltip mode="x" />
    </Chart>
  );
}

export default function SmallMultiples() {
  return (
    <div data-role="small-multiples" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
      {SERVICES.map((service) => (
        <Small key={service.name} {...service} />
      ))}
    </div>
  );
}
