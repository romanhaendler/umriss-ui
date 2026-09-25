import { useState } from "react";
import { Badge, Card, CardBody, CardHeader, FormField, Grid, Slider, Stack, Text } from "../../../src";

export const title = "A mixing station's recipe";

/* The full case: three shares of one recipe, each a slider with its unit and
   its marks, and the sum beside them derived and never stored. The sum is
   the one thing a slider cannot say about itself - whether three rough values
   still add up - so the card says it, as a word and not only as a colour. */

interface Component {
  id: string;
  label: string;
  rated: number;
}

const COMPONENTS: Component[] = [
  { id: "water", label: "Water", rated: 62 },
  { id: "syrup", label: "Syrup", rated: 30 },
  { id: "concentrate", label: "Concentrate", rated: 8 },
];

export default function MixingStation() {
  const [shares, setShares] = useState<Record<string, number>>({ water: 62, syrup: 29.5, concentrate: 8 });
  const sum = COMPONENTS.reduce((total, c) => total + (shares[c.id] ?? 0), 0);
  const exact = Math.abs(sum - 100) < 0.001;

  return (
    <Card style={{ maxWidth: 560 }}>
      <CardHeader
        eyebrow="Mixing station 2"
        title="Recipe: Lemonade 0.5 l"
        actions={<Badge tone={exact ? "success" : "warning"}>{exact ? "Adds up to 100 %" : `Sum ${sum.toFixed(1)} %`}</Badge>}
      />
      <CardBody>
        <Stack gap={5}>
          {COMPONENTS.map((c) => (
            <FormField key={c.id} label={c.label}>
              <Slider
                min={0}
                max={100}
                step={0.5}
                value={shares[c.id] ?? 0}
                onChange={(v) => setShares((previous) => ({ ...previous, [c.id]: v }))}
                format={(v) => `${v.toFixed(1)} %`}
                showValue
                marks={[0, 25, 50, 75, 100, { value: c.rated, label: "Recipe" }]}
              />
            </FormField>
          ))}
          <Grid minItemWidth="140px" gap={3}>
            <Text size="xs" tone="muted">
              Batch: 12,000 l
            </Text>
            <Text size="xs" tone="muted">
              Syrup: {((12000 * (shares.syrup ?? 0)) / 100).toLocaleString("en")} l
            </Text>
          </Grid>
        </Stack>
      </CardBody>
    </Card>
  );
}
