import { Calculation, Chain, Given, Interim, Plus, Product } from "../../../src";

export const title = "A limit violated deep inside";

/* The scrap rate on line 2 is beyond its alarm limit, inside a folded line.
   The folded line says so quietly - "Inside: Alarm limit exceeded" - without
   taking on the alarm's colour itself: its own number is not the one in
   alarm. Open it to find the line that is. */
export default function LimitInside() {
  const scrapLimits = [{ value: 0.03, side: "upper" as const, severity: "alarm" as const }];
  return (
    <Calculation aria-label="Scrap cost, hall 1">
      <Chain>
        <Product label="Scrap cost, line 1" unit="€" decimals={2}>
          <Given label="Scrap rate, line 1" value={0.018} format="percent" limits={scrapLimits} />
          <Given label="Material, line 1" value={24800} unit="€" decimals={2} />
        </Product>
        <Plus>
          <Product label="Scrap cost, line 2" unit="€" decimals={2}>
            <Given label="Scrap rate, line 2" value={0.041} format="percent" limits={scrapLimits} />
            <Given label="Material, line 2" value={19650} unit="€" decimals={2} />
          </Product>
        </Plus>
        <Interim label="Scrap cost, hall 1" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
