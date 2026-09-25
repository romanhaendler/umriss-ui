import { Accordion, AccordionItem, Card, CardBody, CardHeader } from "../../../src";

export const title = "Several open, one locked";

/* `type="multiple"` lets sections stand open side by side - for a reader who
   compares. A `disabled` section keeps its header in the list and does not
   open; the arrows pass it by. `headingLevel` fits the headers into the page's
   outline: under a card's title they are one level down. */
export default function SeveralOpen() {
  return (
    <Card style={{ maxWidth: 560 }}>
      <CardHeader title="Line 3 - documents" />
      <CardBody>
        <Accordion type="multiple" defaultValue={["sop", "hazards"]} headingLevel={4}>
          <AccordionItem value="sop" title="Standard operating procedure">
            Start the line from the operator panel, never from the filler's local panel.
          </AccordionItem>
          <AccordionItem value="hazards" title="Hazards">
            Hot surfaces at the pasteuriser up to 85 °C. Hearing protection at the capper.
          </AccordionItem>
          <AccordionItem value="audit" title="Audit trail" disabled>
            Only for the quality department.
          </AccordionItem>
          <AccordionItem value="contacts" title="Contacts">
            Shift lead: extension 2310. Maintenance on call: extension 2399.
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
}
