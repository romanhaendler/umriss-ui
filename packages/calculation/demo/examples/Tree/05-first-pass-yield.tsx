import { Calculation, Given, Product, Quotient } from "../../../src";

export const title = "First-pass yield across three stations";

/* A product of three quotients, one per station, each built from the
   station's own counts - the rolled throughput yield. Every factor stands
   folded with its formula beneath it; open one to redo it. */

const STATIONS = [
  { name: "Turning", good: 982, made: 1000 },
  { name: "Grinding", good: 961, made: 982 },
  { name: "Final inspection", good: 948, made: 961 },
];

export default function FirstPassYield() {
  return (
    <Calculation aria-label="Rolled throughput yield, shaft line">
      <Product label="Rolled throughput yield" format="percent" target={0.95}>
        {STATIONS.map((station) => (
          <Quotient key={station.name} label={`Yield, ${station.name.toLowerCase()}`} format="percent">
            <Given label={`Good, ${station.name.toLowerCase()}`} value={station.good} unit="pcs" />
            <Given label={`Into ${station.name.toLowerCase()}`} value={station.made} unit="pcs" />
          </Quotient>
        ))}
      </Product>
    </Calculation>
  );
}
