import { Chart, Line, XAxis, YAxis } from "../../../src";

export const title = "Say there is nothing to show";
export const lead = "With no data, only gaps or every series hidden, the frame stays and the plot says so; `empty` puts your own words there.";

interface Reading {
  t: number;
  p95: number;
}

const NOTHING: Reading[] = [];

function Latency({ empty }: { empty?: string }) {
  return (
    <Chart data={NOTHING} height={220} ariaLabel="Latency of a service without readings" empty={empty}>
      <XAxis accessor={(d: Reading) => d.t} time />
      <YAxis accessor={(d: Reading) => d.p95} label="ms" />
      <Line accessor={(d: Reading) => d.p95} name="Refunds" />
    </Chart>
  );
}

export default function Empty() {
  return (
    <div className="pair">
      <div>
        <p className="pair-caption">no empty - the default</p>
        <Latency />
      </div>
      <div>
        <p className="pair-caption">empty="Refunds reports no metrics yet"</p>
        <Latency empty="Refunds reports no metrics yet" />
      </div>
    </div>
  );
}
