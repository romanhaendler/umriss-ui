import { Stepper } from "../../../src";

export const title = "Steps in a column";
export const lead = "Set `orientation` to `vertical` where each step needs a `description` beneath its label, such as a deadline.";

const CLOSE = [
  { label: "Post all invoices", description: "Until Tuesday, 3 March" },
  { label: "Reconcile accounts", description: "Bank, payables, receivables" },
  { label: "Book accruals", description: "Bonuses and open orders" },
  { label: "Report to the board", description: "Friday, 6 March" },
];

export default function StepsInAColumn() {
  return <Stepper aria-label="Closing February" orientation="vertical" steps={CLOSE} current={2} style={{ maxWidth: 360 }} />;
}
