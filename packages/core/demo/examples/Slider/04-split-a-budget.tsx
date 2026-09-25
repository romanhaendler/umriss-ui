import { useState } from "react";
import { Badge, Card, CardBody, CardHeader, FormField, Slider, Stack, Text, useFormats } from "../../../src";

export const title = "Split a budget";
export const lead = "Several sliders share one whole; show the sum they make in words, since no single slider can say it.";

const CHANNELS = [
  { id: "search", label: "Search ads", plan: 45 },
  { id: "events", label: "Events", plan: 30 },
  { id: "content", label: "Content", plan: 25 },
];

const BUDGET = 68_000;

export default function SplitABudget() {
  const formats = useFormats();
  const [shares, setShares] = useState<Record<string, number>>({ search: 45, events: 35, content: 25 });
  const sum = CHANNELS.reduce((total, c) => total + (shares[c.id] ?? 0), 0);

  return (
    <Card style={{ maxWidth: 560 }}>
      <CardHeader
        eyebrow="CC-1200 Marketing · April"
        title={`Budget ${formats.number(BUDGET, 0)} €`}
        actions={<Badge tone={sum === 100 ? "success" : "warning"}>{sum === 100 ? "Adds up to 100 %" : `Sum ${sum} %`}</Badge>}
      />
      <CardBody>
        <Stack gap={5}>
          {CHANNELS.map((c) => (
            <FormField key={c.id} label={c.label}>
              <Slider
                step={5}
                value={shares[c.id] ?? 0}
                onChange={(v) => setShares((previous) => ({ ...previous, [c.id]: v }))}
                format={(v) => `${v} % · ${formats.number((BUDGET * v) / 100, 0)} €`}
                marks={[0, 50, 100, { value: c.plan, label: "Plan" }]}
              />
            </FormField>
          ))}
          <Text size="xs" tone="muted">
            The plan was agreed in the March review.
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
}
