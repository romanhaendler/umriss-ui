import type { CSSProperties } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Checkbox, Link, Stack, Switch, Text } from "../../../src";

export const title = "Accent for the application";
export const lead =
  "One rule on `:root`, outside any cascade layer, gives the whole application its own accent: it wins over the library's tokens whatever order the stylesheets load in. Set the accent's six tokens together, each with a light and a dark value.";

/* In an application these tokens stand in the brand file of core's README,
   in one rule in the application's own stylesheet.

   Here it is set on the example's root, so the rest of the page keeps the
   library's petrol. */
const INDIGO = {
  "--u-color-accent": "light-dark(#4338ca, #818cf8)",
  "--u-color-accent-hover": "light-dark(#3730a3, #a5b4fc)",
  "--u-color-accent-subtle": "light-dark(#eef0fb, #1e1f3d)",
  "--u-color-accent-subtle-pressed": "light-dark(#dfe2f7, #282a52)",
  "--u-color-accent-text": "light-dark(#4338ca, #a5b4fc)",
  "--u-color-on-accent": "light-dark(#ffffff, #1e1b4b)",
} as CSSProperties;

export default function AccentForTheApplication() {
  return (
    <div style={INDIGO}>
      <Card>
        <CardHeader
          eyebrow="Carrow & Lisle"
          title="Invoice INV-2026-0314"
          actions={<Badge tone="accent">Awaiting approval</Badge>}
        />
        <CardBody>
          <Stack gap={3} align="flex-start">
            <Text size="sm" tone="secondary">
              Marketing · 3 lines · due 31/03/2026 · <Link href="#/theming">Open the approval</Link>
            </Text>
            <Switch label="Remind the approver" defaultChecked />
            <Checkbox label="Copy the account owner" defaultChecked />
            <Button variant="ghost" size="sm">
              Approve
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </div>
  );
}
