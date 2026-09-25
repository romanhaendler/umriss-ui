import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Combobox, FormField, Stack } from "../../../src";
import { ENGINEERS, SERVICES } from "@umriss-ui/demo/worlds/operations";

export const title = "Assign an incident";
export const lead = "Build `options` from your records, with the team in the label so typing finds either; one choice decides the next.";

export default function AssignAnIncident() {
  const [service, setService] = useState<string | null>("checkout");
  const [owner, setOwner] = useState<string | null>(null);
  const team = SERVICES.find((s) => s.id === service)?.team;

  return (
    <Card style={{ maxWidth: 480 }}>
      <CardHeader eyebrow="INC-1049 · SEV2" title="Assign the incident" />
      <CardBody>
        <Stack gap={4}>
          <FormField label="Service">
            <Combobox
              value={service}
              onChange={(next) => {
                setService(next);
                setOwner(null);
              }}
              options={SERVICES.map((s) => ({ value: s.id, label: `${s.name} · ${s.team}` }))}
            />
          </FormField>
          <FormField label="Incident lead" hint={team ? `Engineers of ${team} first.` : undefined}>
            <Combobox
              value={owner}
              onChange={setOwner}
              clearable
              placeholder="Type a name or team"
              options={[...ENGINEERS]
                .sort((a, b) => Number(b.team === team) - Number(a.team === team))
                .map((e) => ({ value: e.id, label: `${e.name} · ${e.team}` }))}
            />
          </FormField>
          <Button variant="primary" size="sm" disabled={owner === null} style={{ alignSelf: "flex-start" }}>
            Assign
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );
}
