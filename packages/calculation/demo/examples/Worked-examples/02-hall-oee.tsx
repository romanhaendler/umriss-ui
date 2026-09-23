import { Calculation, Difference, Given, Product, Quotient, Ref, Sum } from "../../../src";

export const title = "OEE of a hall, weighted by planned time";

/* Three lines, each with its own OEE derived from its own counts, weighted by
   how long each was planned to run. A tree three levels deep, built from
   data, each line's quantities named once and referred to by id - and line
   C's downtime has not been booked. Its OEE is missing, so is
   the hall's, and every line on the way says why; lines A and B stand as
   they are. Nothing is averaged over a gap as if it were zero. */

interface Line {
  name: string;
  planned: number;
  downtime: number | null;
  idealCycle: number;
  total: number;
  good: number;
}

const LINES: Line[] = [
  { name: "A", planned: 450, downtime: 38, idealCycle: 0.8, total: 480, good: 461 },
  { name: "B", planned: 450, downtime: 62, idealCycle: 1.2, total: 300, good: 291 },
  { name: "C", planned: 240, downtime: null, idealCycle: 0.5, total: 402, good: 395 },
];

function lineOee(line: Line) {
  const n = line.name;
  return (
    <Product key={n} label={`Weighted OEE, line ${n}`} unit="min">
      <Product label={`OEE, line ${n}`} format="percent">
        <Quotient label={`Availability, line ${n}`} format="percent">
          <Difference id={`runtime-${n}`} label={`Run time, line ${n}`} unit="min">
            <Given id={`planned-${n}`} label={`Planned time, line ${n}`} value={line.planned} unit="min" />
            <Given label={`Downtime, line ${n}`} value={line.downtime} unit="min" source="Shift log" />
          </Difference>
          <Ref to={`planned-${n}`} />
        </Quotient>
        <Quotient label={`Performance, line ${n}`} format="percent">
          <Product label={`Ideal run time, line ${n}`} unit="min">
            <Given label={`Ideal cycle time, line ${n}`} value={line.idealCycle} unit="min/pc" />
            <Given id={`total-${n}`} label={`Total count, line ${n}`} value={line.total} unit="pcs" />
          </Product>
          <Ref to={`runtime-${n}`} />
        </Quotient>
        <Quotient label={`Quality, line ${n}`} format="percent">
          <Given label={`Good count, line ${n}`} value={line.good} unit="pcs" />
          <Ref to={`total-${n}`} />
        </Quotient>
      </Product>
      <Ref to={`planned-${n}`} />
    </Product>
  );
}

export default function HallOee() {
  return (
    <Calculation aria-label="OEE of hall 2, early shift">
      <Quotient label="OEE, hall 2" format="percent" target={0.8}>
        <Sum label="Weighted OEE, all lines" unit="min">
          {LINES.map(lineOee)}
        </Sum>
        <Sum label="Planned time, all lines" unit="min">
          {LINES.map((line) => (
            <Ref key={line.name} to={`planned-${line.name}`} />
          ))}
        </Sum>
      </Quotient>
    </Calculation>
  );
}
