import { Accordion, AccordionItem, Card, CardBody, CardHeader } from "../../../src";

export const title = "Several open, one locked";
export const lead = "Set `type` to `multiple` for a reader who compares, `disabled` on a section that cannot open now, and `headingLevel` to fit the page.";

export default function SeveralOpen() {
  return (
    <Card style={{ maxWidth: 560 }}>
      <CardHeader title="Checkout · runbook" />
      <CardBody>
        <Accordion type="multiple" defaultValue={["symptoms", "first-steps"]} headingLevel={4}>
          <AccordionItem value="symptoms" title="Symptoms">
            p95 latency above 300 ms, card payments failing with a timeout at the provider.
          </AccordionItem>
          <AccordionItem value="first-steps" title="First steps">
            Cap payment retries at one, then check the provider's status page.
          </AccordionItem>
          <AccordionItem value="audit" title="Audit trail" disabled>
            Only for the Payments team's leads.
          </AccordionItem>
          <AccordionItem value="escalation" title="Escalation">
            After 30 minutes page the secondary; after an hour, the head of engineering.
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
}
