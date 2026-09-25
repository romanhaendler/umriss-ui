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

export const title = "The long settings of a machine";

/* The full case: the settings of one filler, too long for one screen, in
   sections. Each header carries what its section holds, so a reader finds a
   setting without opening everything. The fields inside keep their own keys
   - the arrows of the slider move the slider, not the focus between the
   headers - and a folded section keeps its values, because it stays in the
   DOM, inert. */
export default function MachineSettings() {
  const [fillVolume, setFillVolume] = useState<number | null>(500);
  const [speed, setSpeed] = useState(18000);

  return (
    <Card style={{ maxWidth: 600 }}>
      <CardHeader eyebrow="Filler F1" title="Settings" actions={<Badge>Line 3</Badge>} />
      <CardBody>
        <Accordion type="multiple" defaultValue={["dosing"]} headingLevel={4}>
          <AccordionItem value="general" title="General - name, location">
            <Stack gap={3}>
              <FormField label="Name">
                <Input defaultValue="Filler F1" />
              </FormField>
              <FormField label="Hall">
                <Select defaultValue="b">
                  <option value="a">Hall A</option>
                  <option value="b">Hall B</option>
                </Select>
              </FormField>
            </Stack>
          </AccordionItem>
          <AccordionItem value="dosing" title="Dosing - volume, speed">
            <Stack gap={4}>
              <FormField label="Fill volume" hint="Per bottle, checked at the checkweigher.">
                <NumberInput value={fillVolume} onChange={setFillVolume} min={330} max={1000} suffix="ml" />
              </FormField>
              <FormField label="Speed">
                <Slider
                  min={6000}
                  max={24000}
                  step={500}
                  value={speed}
                  onChange={setSpeed}
                  format={(v) => `${v.toLocaleString("en")} bottles/h`}
                  marks={[{ value: 18000, label: "Rated" }]}
                />
              </FormField>
            </Stack>
          </AccordionItem>
          <AccordionItem value="cleaning" title="Cleaning - interval, automatic start">
            <Stack gap={3}>
              <FormField label="Interval">
                <NumberInput value={72} onChange={() => undefined} suffix="h" />
              </FormField>
              <Switch label="Start cleaning automatically at the end of a batch" defaultChecked />
            </Stack>
          </AccordionItem>
          <AccordionItem value="alarms" title="Alarms - limits, horn">
            <Stack gap={3}>
              <FormField label="Underfill below">
                <NumberInput value={498} onChange={() => undefined} suffix="ml" />
              </FormField>
              <Switch label="Sound the horn on a stop" />
            </Stack>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
}
