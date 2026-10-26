/* `baseline` on `Bar` is typed as `Area`'s is: a number field of the row or a
   function of it. Compiled by `typecheck`; every `@ts-expect-error` MUST yield
   an error. */

import { useChart } from "../src";

interface Step {
  step: string;
  from: number;
  to: number;
}

declare const steps: Step[];

export function Waterfall() {
  const { Chart, Bar } = useChart(steps);
  return (
    <Chart aria-label="Steps">
      <Bar value="to" baseline="from" />
      <Bar value="to" baseline={(d) => d.from - 1} />
      {/* @ts-expect-error a baseline is a number field */}
      <Bar value="to" baseline="step" />
    </Chart>
  );
}
