import { useId, useState } from "react";
import { Badge, Card, CardBody, CardHeader, Divider, Stack, Switch, Text } from "../../../src";

export const title = "Settings of a service";
export const lead = "Give each switch its sentence through `aria-describedby`, and say why when one is `disabled` for now.";

interface Setting {
  id: string;
  label: string;
  description: string;
  lockedDuringIncident?: boolean;
}

const SETTINGS: Setting[] = [
  { id: "deploys", label: "Deployments", description: "Lets the pipeline release to production." },
  { id: "canary", label: "Canary releases", description: "Sends a new release to 5 % of traffic for 15 minutes first." },
  { id: "flags", label: "Feature flag changes", description: "Only while no incident is open on this service.", lockedDuringIncident: true },
  { id: "page", label: "Page on-call", description: "Pages the primary when the latency objective is breached." },
  { id: "digest", label: "Weekly digest", description: "Mails the team the week's latency and error budget." },
];

export default function SettingsOfAService() {
  const [on, setOn] = useState<Record<string, boolean>>({ deploys: true, canary: true, page: true });
  const incidentOpen = true;
  const base = useId();
  const count = SETTINGS.filter((s) => on[s.id]).length;

  return (
    <Card style={{ maxWidth: 520 }}>
      <CardHeader eyebrow="Checkout · Payments" title="Service settings" actions={<Badge pill>{count} on</Badge>} />
      <CardBody>
        <Stack gap={3}>
          {SETTINGS.map((s, i) => {
            const locked = s.lockedDuringIncident === true && incidentOpen;
            return (
              <Stack key={s.id} gap={3}>
                {i > 0 && <Divider />}
                <Stack gap={1}>
                  <Switch
                    label={s.label}
                    checked={on[s.id] === true}
                    disabled={locked}
                    aria-describedby={`${base}-${s.id}`}
                    onChange={(event) => setOn((previous) => ({ ...previous, [s.id]: event.target.checked }))}
                  />
                  <Text id={`${base}-${s.id}`} size="xs" tone="muted" style={{ paddingLeft: 36 }}>
                    {locked ? "Locked while INC-1048 is open. " : ""}
                    {s.description}
                  </Text>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </CardBody>
    </Card>
  );
}
