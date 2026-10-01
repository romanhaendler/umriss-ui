import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Combobox, FormField, Stack } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */
interface Service {
  id: string;
  name: string;
  team: string;
  /** 1 is customer-facing and pages at night; 3 waits for the morning. */
  tier: 1 | 2 | 3;
  /** The latency objective: the 95th percentile stays below this, in ms. */
  latencySlo: number;
  /** The availability promised for a month, in per cent. */
  availabilityTarget: number;
}

const SERVICES: readonly Service[] = [
  { id: "checkout", name: "Checkout", team: "Payments", tier: 1, latencySlo: 300, availabilityTarget: 99.95 },
  { id: "billing", name: "Billing", team: "Payments", tier: 1, latencySlo: 400, availabilityTarget: 99.9 },
  { id: "sign-in", name: "Sign-in", team: "Identity", tier: 1, latencySlo: 200, availabilityTarget: 99.95 },
  { id: "search", name: "Search", team: "Discovery", tier: 1, latencySlo: 250, availabilityTarget: 99.9 },
  { id: "images", name: "Image service", team: "Discovery", tier: 2, latencySlo: 500, availabilityTarget: 99.5 },
  { id: "notifications", name: "Notifications", team: "Messaging", tier: 2, latencySlo: 800, availabilityTarget: 99.5 },
  { id: "webhooks", name: "Webhooks", team: "Integrations", tier: 2, latencySlo: 1000, availabilityTarget: 99.5 },
  { id: "reports", name: "Reporting", team: "Insights", tier: 3, latencySlo: 2000, availabilityTarget: 99 },
];

interface Engineer {
  id: string;
  name: string;
  team: string;
}

const ENGINEERS: readonly Engineer[] = [
  { id: "priya", name: "Priya Raman", team: "Payments" },
  { id: "jonas", name: "Jonas Keller", team: "Payments" },
  { id: "ada", name: "Ada Mwangi", team: "Identity" },
  { id: "tomasz", name: "Tomasz Nowak", team: "Discovery" },
  { id: "leila", name: "Leila Haddad", team: "Discovery" },
  { id: "sam", name: "Sam Okafor", team: "Messaging" },
  { id: "ines", name: "Ines Duarte", team: "Integrations" },
  { id: "felix", name: "Felix Brandt", team: "Insights" },
];

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
