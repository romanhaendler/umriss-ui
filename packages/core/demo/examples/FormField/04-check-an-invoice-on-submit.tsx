import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, DatePicker, FormField, Grid, Input, NumberInput, Select, Stack, Text, announce } from "../../../src";

export const title = "Check an invoice on submit";
export const lead =
  "Hold the values, check them all on submit, and give each `FormField` its own message; the summary, the announcement and the focus are the application's, since only it knows its form.";

interface Invoice {
  number: string;
  centre: string;
  amount: number | null;
  due: Date | null;
}

type Errors = Partial<Record<keyof Invoice, string>>;

function check(invoice: Invoice): Errors {
  const errors: Errors = {};
  if (!/^INV-\d{4}$/.test(invoice.number)) errors.number = "An invoice number reads INV- and four digits.";
  if (invoice.centre === "") errors.centre = "Choose the cost centre the invoice is booked on.";
  if (invoice.amount === null || invoice.amount <= 0) errors.amount = "Give the net amount.";
  if (invoice.due === null) errors.due = "Give the due date from the invoice.";
  return errors;
}

const KEYS = ["number", "centre", "amount", "due"] as const;

export default function CheckAnInvoiceOnSubmit() {
  const [invoice, setInvoice] = useState<Invoice>({ number: "INV-31", centre: "", amount: 4860, due: null });
  const [errors, setErrors] = useState<Errors>({});
  const [booked, setBooked] = useState(false);
  /* Every focus goes through the control's own ref; a DatePicker's is its trigger. */
  const numberRef = useRef<HTMLInputElement>(null);
  const centreRef = useRef<HTMLSelectElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const dueRef = useRef<HTMLButtonElement>(null);
  const focus = (key: (typeof KEYS)[number]) => ({ number: numberRef, centre: centreRef, amount: amountRef, due: dueRef })[key].current?.focus();
  const set = (patch: Partial<Invoice>) => setInvoice((previous) => ({ ...previous, ...patch }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = check(invoice);
    setErrors(next);
    setBooked(Object.keys(next).length === 0);
    const failed = KEYS.filter((key) => next[key] !== undefined);
    if (failed.length === 0) return;
    announce(failed.length === 1 ? "1 problem with the invoice." : `${failed.length} problems with the invoice.`);
    focus(failed[0]!);
  };

  const problems = KEYS.filter((key) => errors[key] !== undefined);

  return (
    <form onSubmit={submit} noValidate style={{ maxWidth: 560 }}>
      <Stack gap={4}>
        {problems.length > 0 && (
          <section aria-labelledby="invoice-problems" style={{ border: "1px solid var(--u-color-danger)", borderRadius: 6, padding: "var(--u-space-3) var(--u-space-4)" }}>
            <Text as="h3" id="invoice-problems" size="md" weight="semibold">
              {problems.length === 1 ? "There is 1 problem" : `There are ${problems.length} problems`}
            </Text>
            <Text as="ul" size="sm" style={{ margin: 0, paddingInlineStart: "var(--u-space-4)" }}>
              {problems.map((key) => (
                <li key={key}>
                  <a
                    href="#"
                    style={{ color: "var(--u-color-danger)" }}
                    onClick={(event) => {
                      event.preventDefault();
                      focus(key);
                    }}
                  >
                    {errors[key]}
                  </a>
                </li>
              ))}
            </Text>
          </section>
        )}
        <Grid minItemWidth="220px" gap={4}>
          <FormField label="Invoice number" required error={errors.number}>
            <Input ref={numberRef} numeric value={invoice.number} onChange={(event) => set({ number: event.target.value })} />
          </FormField>
          <FormField label="Cost centre" required error={errors.centre}>
            <Select ref={centreRef} value={invoice.centre} onChange={(event) => set({ centre: event.target.value })}>
              <option value="" disabled>
                Choose a cost centre
              </option>
              <option value="CC-1200">CC-1200 Marketing</option>
              <option value="CC-2200">CC-2200 Design</option>
              <option value="CC-4300">CC-4300 IT</option>
            </Select>
          </FormField>
          <FormField label="Net amount" required error={errors.amount}>
            <NumberInput ref={amountRef} value={invoice.amount} onChange={(amount) => set({ amount })} min={0} decimals={2} suffix="€" />
          </FormField>
          <FormField label="Due" required error={errors.due}>
            <DatePicker ref={dueRef} value={invoice.due} onChange={(due) => set({ due })} clearable />
          </FormField>
        </Grid>
        <Stack direction="row" gap={3} align="center">
          <Button type="submit" variant="primary" size="sm">
            Book the invoice
          </Button>
          {booked && (
            <Text size="sm" tone="muted">
              {invoice.number} booked on {invoice.centre}.
            </Text>
          )}
        </Stack>
      </Stack>
    </form>
  );
}
