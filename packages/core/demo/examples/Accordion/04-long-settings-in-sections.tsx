import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  Badge,
  Card,
  CardBody,
  CardHeader,
  FormField,
  Input,
  NumberInput,
  Select,
  Slider,
  Stack,
  Switch,
} from "../../../src";

export const title = "Long settings in sections";
export const lead = "Name what each section holds in its header; fields inside keep their own keys, and a folded section keeps its values.";

export default function LongSettingsInSections() {
  const [limit, setLimit] = useState<number | null>(5000);
  const [reminder, setReminder] = useState(3);

  return (
    <Card style={{ maxWidth: 600 }}>
      <CardHeader eyebrow="Finance" title="Approval rules" actions={<Badge>Carrow & Lisle</Badge>} />
      <CardBody>
        <Accordion type="multiple" defaultValue={["thresholds"]} headingLevel={4}>
          <AccordionItem value="general" title="General - name, cost centre">
            <Stack gap={3}>
              <FormField label="Name">
                <Input defaultValue="Incoming invoices" />
              </FormField>
              <FormField label="Applies to">
                <Select defaultValue="all">
                  <option value="all">All cost centres</option>
                  <option value="CC-1200">Marketing, CC-1200</option>
                  <option value="CC-4300">IT, CC-4300</option>
                </Select>
              </FormField>
            </Stack>
          </AccordionItem>
          <AccordionItem value="thresholds" title="Thresholds - second signature, reminders">
            <Stack gap={4}>
              <FormField label="Finance signs from" hint="Net amount; below it the cost centre's owner signs alone.">
                <NumberInput value={limit} onChange={setLimit} min={0} step={500} suffix="€" />
              </FormField>
              <FormField label="Remind the approver after">
                <Slider
                  min={1}
                  max={10}
                  value={reminder}
                  onChange={setReminder}
                  format={(v) => `${v} working days`}
                  marks={[{ value: 3, label: "Default" }]}
                />
              </FormField>
            </Stack>
          </AccordionItem>
          <AccordionItem value="payment" title="Payment - run, early payment discount">
            <Stack gap={3}>
              <FormField label="Payment run">
                <Select defaultValue="tue-fri">
                  <option value="tue-fri">Tuesday and Friday</option>
                  <option value="daily">Every working day</option>
                </Select>
              </FormField>
              <Switch label="Pay early where the supplier grants a discount" defaultChecked />
            </Stack>
          </AccordionItem>
          <AccordionItem value="archive" title="Archive - retention">
            <Stack gap={3}>
              <FormField label="Keep invoices for">
                <NumberInput value={10} onChange={() => undefined} suffix="years" />
              </FormField>
              <Switch label="Archive rejected invoices as well" />
            </Stack>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
}
