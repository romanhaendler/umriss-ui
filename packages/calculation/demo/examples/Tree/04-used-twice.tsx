import { Calculation, Given, Product, Quotient, Ref } from "../../../src";

export const title = "A quantity used twice";

/* The material per part enters both products. It is defined once, where it
   first belongs, and stands as a `<Ref>` in the second place: a reference
   shows the quantity's name and number, in italics, never its derivation
   again. Open both products and hover either place - both light up. */
export default function UsedTwice() {
  return (
    <Calculation aria-label="Material lost to scrap, week 12">
      <Quotient label="Material lost to scrap" format="percent" decimals={2}>
        <Product label="Scrap cost" unit="€" decimals={2}>
          <Given label="Scrapped parts" value={38} unit="pcs" />
          <Given id="material" label="Material per part" value={2.8} unit="€" decimals={2} />
        </Product>
        <Product label="Material cost" unit="€" decimals={2}>
          <Given label="Parts made" value={1278} unit="pcs" />
          <Ref to="material" />
        </Product>
      </Quotient>
    </Calculation>
  );
}
