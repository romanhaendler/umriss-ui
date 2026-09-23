import { Calculation, Chain, Given, Interim, Plus, Times } from "../../../src";

export const title = "Mark-up and VAT";

/* A chain has no precedence: every line works into the value before it. So a
   `<Times>` stands alone between two named values - directly after an
   interim and directly before the next. Writing it after a `<Plus>` fails on
   the first render; nobody multiplies a number they have not seen. */
export default function MarkUpAndVat() {
  return (
    <Calculation aria-label="Price of a spare part">
      <Chain>
        <Given label="Cost price" value={148.2} unit="€" />
        <Plus label="Handling" value={12} unit="€" />
        <Interim label="Cost with handling" unit="€" decimals={2} />
        <Times label="Mark-up" value={1.25} />
        <Interim label="Net price" unit="€" decimals={2} />
        <Times label="VAT factor" value={1.19} />
        <Interim label="Gross price" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
