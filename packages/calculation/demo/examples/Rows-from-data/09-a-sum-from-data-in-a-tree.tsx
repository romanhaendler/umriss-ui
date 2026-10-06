import { Calculation, Difference, Given, Sum } from "../../../src";

export const title = "A sum from data in a tree";
export const lead =
  "Rows from data work in a tree as in a chain: here the stock movements of a day, whatever their count and sign, stand as one operand of a `Difference`. Taken away, a negative total turns into a plus – \"+ Movements 7\" – and the derivation closes with its own sign.";

const MOVEMENTS = [
  { id: "m1", name: "Picked, order 5512", amount: -12 },
  { id: "m2", name: "Received, delivery 881", amount: 40 },
  { id: "m3", name: "Picked, order 5517", amount: -35 },
];

export default function ASumFromDataInATree() {
  return (
    <Calculation aria-label="Shelf B-14, 17 March">
      <Difference label="Gap to plan" unit="pcs">
        <Given label="Planned stock" value={150} unit="pcs" />
        <Given label="Stock this morning" value={142} unit="pcs" />
        <Sum label="Movements" unit="pcs">
          {MOVEMENTS.map((movement) => (
            <Given key={movement.id} label={movement.name} value={movement.amount} unit="pcs" />
          ))}
        </Sum>
      </Difference>
    </Calculation>
  );
}
