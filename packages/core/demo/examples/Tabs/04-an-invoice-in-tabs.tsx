import { Badge, Card, CardBody, CardHeader, Grid, Stack, Stepper, Tab, TabList, TabPanel, Tabs, Text } from "../../../src";
import { APPROVALS, INVOICES } from "@umriss-ui/demo/worlds/controlling";

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
