import { Badge, Card, CardBody, CardHeader, Grid, Stack, Stepper, Tab, TabList, TabPanel, Tabs, Text } from "../../../src";

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

interface Approval {
  invoice: string;
  step: "cost centre" | "finance";
  approver: string;
  decision: "approved" | "rejected" | "pending";
  at?: number;
  comment?: string;
}

/** Two signatures an invoice needs: its cost centre's owner, then finance. */
const APPROVALS: readonly Approval[] = [
  { invoice: "INV-26-0318", step: "cost centre", approver: "Olga Ivanova", decision: "pending" },
  { invoice: "INV-26-0317", step: "cost centre", approver: "Rafael Ortiz", decision: "approved", at: on(3, 16) },
  { invoice: "INV-26-0317", step: "finance", approver: "Martina Vogel", decision: "pending" },
  { invoice: "INV-26-0309", step: "cost centre", approver: "Kenji Arai", decision: "approved", at: on(3, 10) },
  { invoice: "INV-26-0309", step: "finance", approver: "Martina Vogel", decision: "approved", at: on(3, 11) },
  { invoice: "INV-26-0302", step: "cost centre", approver: "Martina Vogel", decision: "approved", at: on(3, 3) },
  { invoice: "INV-26-0302", step: "finance", approver: "Martina Vogel", decision: "approved", at: on(3, 3) },
  { invoice: "INV-26-0226", step: "cost centre", approver: "Helen Marsh", decision: "approved", at: on(2, 27) },
  { invoice: "INV-26-0226", step: "finance", approver: "Martina Vogel", decision: "approved", at: on(3, 2) },
  { invoice: "INV-26-0221", step: "cost centre", approver: "Anika Sørensen", decision: "rejected", at: on(2, 24), comment: "Not ordered - the review was cancelled in January." },
];

export const title = "An invoice in tabs";
export const lead = "Tabs split one record into views of different shape; a count in the tab's label says what waits behind it.";

const INVOICE = INVOICES.find((invoice) => invoice.id === "INV-26-0317")!;
const SIGNATURES = APPROVALS.filter((approval) => approval.invoice === INVOICE.id);
const euro = (amount: number) => amount.toLocaleString("en", { style: "currency", currency: "EUR" });
const net = (line: (typeof INVOICE.lines)[number]) => line.quantity * line.unitPrice * (1 - line.discount);
const day = (time: number) => new Date(time).toLocaleDateString("en-GB", { day: "numeric", month: "long" });

export default function AnInvoiceInTabs() {
  const pending = SIGNATURES.findIndex((approval) => approval.decision === "pending");

  return (
    <Card style={{ maxWidth: 640 }}>
      <CardHeader
        eyebrow={`Invoice ${INVOICE.id}`}
        title={INVOICE.supplier}
        actions={<Badge tone="warning">Awaiting approval</Badge>}
      />
      <CardBody>
        <Tabs defaultValue="lines">
          <TabList aria-label={`Invoice ${INVOICE.id}`}>
            <Tab value="lines">Lines ({INVOICE.lines.length})</Tab>
            <Tab value="approvals">Approvals ({SIGNATURES.length})</Tab>
            <Tab value="payment">Payment</Tab>
          </TabList>
          <TabPanel value="lines">
            <Stack gap={2} style={{ paddingTop: 12 }}>
              {INVOICE.lines.map((line) => (
                <Grid key={line.description} columns={3} gap={3}>
                  <Text size="sm">{line.description}</Text>
                  <Text size="sm" tone="secondary">
                    {line.quantity} × {euro(line.unitPrice)}
                    {line.discount > 0 ? `, ${line.discount * 100} % off` : ""}
                  </Text>
                  <Text size="sm" style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {euro(net(line))}
                  </Text>
                </Grid>
              ))}
            </Stack>
          </TabPanel>
          <TabPanel value="approvals">
            <Stepper
              aria-label="Approvals"
              orientation="vertical"
              style={{ paddingTop: 12 }}
              steps={SIGNATURES.map((approval) => ({
                label: `${approval.step === "finance" ? "Finance" : "Cost centre"}: ${approval.approver}`,
                description: approval.at === undefined ? "Waiting" : `${approval.decision}, ${day(approval.at)}`,
                failed: approval.decision === "rejected",
              }))}
              current={pending === -1 ? SIGNATURES.length : pending}
            />
          </TabPanel>
          <TabPanel value="payment">
            <Text size="sm" tone="secondary" style={{ paddingTop: 12 }}>
              Received {day(INVOICE.received)}, due {day(INVOICE.due)}, from cost centre {INVOICE.costCentre}.
            </Text>
          </TabPanel>
        </Tabs>
      </CardBody>
    </Card>
  );
}
