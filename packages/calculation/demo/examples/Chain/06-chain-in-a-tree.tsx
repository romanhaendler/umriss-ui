import { Calculation, Chain, Given, Interim, Minus, Plus, Quotient, Ref } from "../../../src";

export const title = "Put a chain inside a tree";
export const lead = "As an operand a chain folds and stands for its last interim; opened, it stands whole beneath its line.";

export default function ChainInATree() {
  return (
    <Calculation aria-label="Delivery rate, North depot, Tuesday">
      <Quotient label="Delivery rate" format="percent" target={0.97}>
        <Chain>
          <Given id="out" label="Parcels out" value={1000} unit="parcels" />
          <Minus label="Failed attempts" value={31} unit="parcels" />
          <Minus label="Refused at the door" value={6} unit="parcels" />
          <Plus label="Delivered on a second run" value={14} unit="parcels" />
          <Interim label="Parcels delivered" unit="parcels" />
        </Chain>
        <Ref to="out" />
      </Quotient>
    </Calculation>
  );
}
