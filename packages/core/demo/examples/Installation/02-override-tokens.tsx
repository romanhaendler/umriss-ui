import type { CSSProperties } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Link, Stack, Text } from "../../../src";

export const title = "Override tokens";
export const lead = "Set a `--u-…` token in CSS outside a cascade layer and it wins, whatever order the stylesheets load in.";

/* In an application this is one rule in its own stylesheet:

     :root {
       --u-font-sans: Georgia, "Times New Roman", serif;
       --u-color-accent-text: #9a3412;
     }

   Here it is set on one element, so the rest of the page keeps the defaults. */
const HOUSE_STYLE = {
  "--u-font-sans": 'Georgia, "Times New Roman", serif',
  "--u-color-accent-text": "#9a3412",
} as CSSProperties;

function Invoice() {
  return (
    <Card>
      <CardHeader
        eyebrow="Carrow & Lisle"
        title="Invoice INV-2026-0314"
        actions={<Badge tone="warning">Awaiting approval</Badge>}
      />
      <CardBody>
        <Stack gap={3} align="flex-start">
          <Text size="sm" tone="secondary">
            Marketing · 3 lines · due 31/03/2026 · <Link href="#/installation">Open the approval</Link>
          </Text>
          <Button size="sm">Approve</Button>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default function OverrideTokens() {
  return (
    <Stack gap={4}>
      <Invoice />
      <div style={HOUSE_STYLE}>
        <Invoice />
      </div>
    </Stack>
  );
}
