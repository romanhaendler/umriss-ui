import { useState } from "react";
import { Card, CardBody, CardHeader, DateTimeRangePicker, FormField, Input, MultiSelect, Stack } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "Narrow places";
export const lead =
  "A field is never wider than its place - not with `chars={34}`, not with the longest range of instants. In a narrow card it shrinks with it, and what no longer fits ends in an ellipsis instead of pushing the page sideways.";

const TEAM = ["Maya Lindgren", "Luis Moreno", "Ada Okafor", "Jun Park"].map((name) => ({ value: name, label: name }));

export default function NarrowPlaces() {
  const [slot, setSlot] = useState<DateRange | null>({
    from: new Date(2026, 2, 16, 6, 0),
    to: new Date(2026, 2, 20, 22, 0),
  });
  const [team, setTeam] = useState<string[]>(["Maya Lindgren", "Luis Moreno"]);

  return (
    <Card style={{ maxWidth: 280 }}>
      <CardHeader title="Maintenance window" />
      <CardBody>
        <Stack gap={3}>
          <FormField label="IBAN for the invoice">
            <Input chars={34} defaultValue="GB33 BUKB 2020 1555 5555 55" />
          </FormField>
          <FormField label="Window">
            <DateTimeRangePicker value={slot} onChange={setSlot} />
          </FormField>
          <FormField label="On call">
            <MultiSelect options={TEAM} value={team} onChange={setTeam} />
          </FormField>
        </Stack>
      </CardBody>
    </Card>
  );
}
