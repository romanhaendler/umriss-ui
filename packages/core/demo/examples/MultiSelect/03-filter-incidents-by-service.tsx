import { useState } from "react";
import { Badge, FormField, MultiSelect, Stack, Text } from "../../../src";
import { INCIDENTS, SERVICES } from "@umriss-ui/demo/worlds/operations";

export const title = "Filter incidents by service";
export const lead = "An empty value means no filter; the panel's search, select-all and chosen view help once the list is long.";

export default function FilterIncidentsByService() {
  const [services, setServices] = useState<string[]>(["checkout", "billing"]);
  const shown = INCIDENTS.filter((i) => services.length === 0 || services.includes(i.service));

  return (
    <Stack gap={4} style={{ maxWidth: 520 }}>
      <FormField label="Services">
        <MultiSelect
          value={services}
          onChange={setServices}
          placeholder="All services"
          searchPlaceholder="Search services"
          options={SERVICES.map((s) => ({ value: s.id, label: s.name }))}
        />
      </FormField>
      <Stack gap={2}>
        {shown.map((incident) => (
          <Stack key={incident.id} direction="row" gap={3} align="center">
            <Badge tone={incident.severity === "SEV1" ? "danger" : "warning"}>{incident.severity}</Badge>
            <Text size="sm" mono>
              {incident.id}
            </Text>
            <Text size="sm">{incident.title}</Text>
          </Stack>
        ))}
        {shown.length === 0 && (
          <Text size="sm" tone="muted">
            No incidents on these services this month.
          </Text>
        )}
      </Stack>
    </Stack>
  );
}
