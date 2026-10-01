import { useState } from "react";
import { Button, ButtonGroup, MenuItem, MenuSeparator, SplitButton, Stack, Text } from "../../../src";

/* Data from the controlling world, written out here so the example runs on its own. */
const on = (month: number, day: number) => new Date(2026, month - 1, day).getTime();

interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  /** A fraction: 0.1 is ten per cent off. */
  discount: number;
  /** A fraction: 0.19 or 0.07, or 0 where no VAT is charged. */
  vatRate: number;
}

interface Invoice {
  id: string;
  supplier: string;
  costCentre: string;
  received: number;
  due: number;
  status: "awaiting approval" | "approved" | "paid" | "rejected";
  lines: readonly InvoiceLine[];
}

const INVOICES: readonly Invoice[] = [
  {
    id: "INV-26-0318", supplier: "Brandlow Office Supply", costCentre: "CC-4400", received: on(3, 16), due: on(4, 15), status: "awaiting approval",
    lines: [
      { description: "Desk lamps, LED", quantity: 24, unitPrice: 48.9, discount: 0.1, vatRate: 0.19 },
      { description: "Printer paper, box of 5 reams", quantity: 40, unitPrice: 21.5, discount: 0, vatRate: 0.19 },
      { description: "Delivery", quantity: 1, unitPrice: 35, discount: 0, vatRate: 0.19 },
    ],
  },
  {
    id: "INV-26-0317", supplier: "Kettering & Shaw Events", costCentre: "CC-1200", received: on(3, 13), due: on(4, 12), status: "awaiting approval",
    lines: [
      { description: "Trade fair stand, 3 days", quantity: 1, unitPrice: 12_400, discount: 0.05, vatRate: 0.19 },
      { description: "Catering, per guest", quantity: 180, unitPrice: 18.5, discount: 0, vatRate: 0.07 },
    ],
  },
  {
    id: "INV-26-0309", supplier: "Nimbrel Software", costCentre: "CC-4300", received: on(3, 9), due: on(4, 8), status: "approved",
    lines: [
      { description: "Design tool licences, annual", quantity: 12, unitPrice: 540, discount: 0.15, vatRate: 0.19 },
      { description: "Onboarding session", quantity: 2, unitPrice: 890, discount: 0, vatRate: 0.19 },
    ],
  },
  {
    id: "INV-26-0302", supplier: "Fenwright Legal", costCentre: "CC-4100", received: on(3, 2), due: on(3, 16), status: "paid",
    lines: [{ description: "Contract review, hours", quantity: 14.5, unitPrice: 260, discount: 0, vatRate: 0.19 }],
  },
  {
    id: "INV-26-0226", supplier: "Corrin Travel", costCentre: "CC-1100", received: on(2, 26), due: on(3, 12), status: "paid",
    lines: [
      { description: "Rail tickets, sales conference", quantity: 22, unitPrice: 139, discount: 0, vatRate: 0.07 },
      { description: "Hotel, nights", quantity: 44, unitPrice: 112, discount: 0.08, vatRate: 0.07 },
    ],
  },
  {
    id: "INV-26-0221", supplier: "Stellbrook Consulting", costCentre: "CC-2100", received: on(2, 21), due: on(3, 23), status: "rejected",
    lines: [{ description: "Architecture review, days", quantity: 6, unitPrice: 1450, discount: 0, vatRate: 0 }],
  },
];

export const title = "Build an invoice toolbar";
export const lead = "A group to page through the queue and a split button for the decision, as an approver's toolbar puts them.";

const QUEUE = INVOICES.filter((invoice) => invoice.status === "awaiting approval");

export default function InvoiceToolbar() {
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState("");
  const invoice = QUEUE[index]!;
  const decide = (what: string) => setNote(`${invoice.id}: ${what}`);

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={3} align="center" justify="space-between" wrap>
        <Stack direction="row" gap={3} align="center" wrap>
          <ButtonGroup aria-label="Invoices awaiting approval">
            <Button size="sm" disabled={index === 0} onClick={() => setIndex(index - 1)}>
              Previous
            </Button>
            <Button size="sm" disabled={index === QUEUE.length - 1} onClick={() => setIndex(index + 1)}>
              Next
            </Button>
          </ButtonGroup>
          <Text size="sm">
            <Text as="span" size="sm" mono>
              {invoice.id}
            </Text>{" "}
            · {invoice.supplier} · {index + 1} of {QUEUE.length}
          </Text>
        </Stack>
        <SplitButton
          size="sm"
          variant="primary"
          onClick={() => decide("approved")}
          menu={
            <>
              <MenuItem onSelect={() => decide("approved with a comment")}>Approve with a comment</MenuItem>
              <MenuItem onSelect={() => decide("sent back to the requester")}>Send back</MenuItem>
              <MenuSeparator />
              <MenuItem tone="danger" onSelect={() => decide("rejected")}>
                Reject
              </MenuItem>
            </>
          }
        >
          Approve
        </SplitButton>
      </Stack>
      <Text size="xs" tone="muted">
        {note === "" ? "No decision yet" : note}
      </Text>
    </Stack>
  );
}
