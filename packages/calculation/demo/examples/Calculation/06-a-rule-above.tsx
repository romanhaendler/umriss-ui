import { Calculation, Chain, Given, Interim, Minus, Plus } from "../../../src";

export const title = "A rule above";
export const lead =
  "`rule=\"above\"` rules a line off from the ones before it, where a new section starts that needs no interim of its own: here the deductions after the earnings. An interim draws its rule across the figures only; this one runs across the whole row.";

export default function ARuleAbove() {
  return (
    <Calculation aria-label="Payslip, March">
      <Chain>
        <Given label="Gross salary" value={4200} unit="€" decimals={2} />
        <Plus label="Night work bonus" value={84} unit="€" decimals={2} />
        <Plus label="Travel allowance" value={60} unit="€" decimals={2} />
        <Minus label="Income tax" value={640.2} unit="€" decimals={2} rule="above" />
        <Minus label="Church tax" value={51.2} unit="€" decimals={2} />
        <Minus label="Social security contributions" value={889.6} unit="€" decimals={2} />
        <Interim label="Net salary" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
