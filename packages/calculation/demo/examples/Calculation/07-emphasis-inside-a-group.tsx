import { Calculation, Chain, Given, Interim, Plus, Sum } from "../../../src";

export const title = "Emphasis inside a group";
export const lead =
  "Emphasis and rule work inside an opened derivation too. Its numbers already recede, so a muted line there recedes one step further; a strong one stands out from the group, and a rule parts the group where its rows do not.";

/* Cost centres from the controlling system. */
const CENTRES = [
  { id: "4100", name: "4100 Assembly", amount: 18400, emphasis: "strong" as const },
  { id: "4200", name: "4200 Paint shop", amount: 9200 },
  { id: "4300", name: "4300 Quality", amount: 6100 },
  { id: "9900", name: "9900 Allocations", amount: 740, emphasis: "muted" as const, rule: "above" as const },
];

export default function EmphasisInsideAGroup() {
  return (
    <Calculation aria-label="Production cost, March">
      <Chain>
        <Given label="Material" value={52800} unit="€" />
        <Plus>
          <Sum label="Cost centres" unit="€">
            {CENTRES.map((centre) => (
              <Given
                key={centre.id}
                label={centre.name}
                value={centre.amount}
                unit="€"
                emphasis={centre.emphasis}
                rule={centre.rule}
              />
            ))}
          </Sum>
        </Plus>
        <Interim label="Production cost" unit="€" />
      </Chain>
    </Calculation>
  );
}
