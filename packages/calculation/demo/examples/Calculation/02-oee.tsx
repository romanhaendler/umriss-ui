import { countAt, IDEAL_CYCLE_MINUTES, plant, SHIFT_MINUTES } from "@umriss-ui/demo/worlds/plant";
import { Calculation, Difference, Given, Product, Quotient, Ref } from "../../../src";

export const title = "Write a tree";
export const lead = "Nest operators for a figure made of factors: each folds with its formula under its name, and `Ref` stands for a quantity used twice.";

const COUNT = countAt(plant(17), SHIFT_MINUTES);

export default function Oee() {
  return (
    <Calculation aria-label="OEE of the kiln line, early shift">
      <Product label="OEE" format="percent" target={0.85}>
        <Quotient label="Availability" format="percent">
          <Difference id="runtime" label="Run time" unit="min">
            <Given id="planned" label="Planned production time" value={COUNT.planned} unit="min" />
            <Given label="Downtime" value={COUNT.downtime} unit="min" />
          </Difference>
          <Ref to="planned" />
        </Quotient>
        <Quotient label="Performance" format="percent">
          <Product label="Ideal run time" unit="min">
            <Given label="Ideal cycle time" value={IDEAL_CYCLE_MINUTES} unit="min/tile" />
            <Given id="total" label="Tiles fired" value={COUNT.total} unit="tiles" />
          </Product>
          <Ref to="runtime" />
        </Quotient>
        <Quotient label="Quality" format="percent">
          <Given label="Good tiles" value={COUNT.good} unit="tiles" />
          <Ref to="total" />
        </Quotient>
      </Product>
    </Calculation>
  );
}
