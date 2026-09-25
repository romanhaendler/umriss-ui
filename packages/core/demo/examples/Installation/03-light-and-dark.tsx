import { Badge, Card, CardBody, CardHeader, Grid, Text } from "../../../src";

export const title = "Light and dark";
export const lead = "The tokens follow `color-scheme`: set it on the page for the whole application, or on one element for a part of it.";

/* The application's switch is one CSS line, which its native controls need
   anyway:

     html.dark { color-scheme: dark; }
     :root { color-scheme: light dark; }  (or: follow the system)

   Nothing set means light. */
function Tour({ scheme }: { scheme: "light" | "dark" }) {
  return (
    <div style={{ colorScheme: scheme, background: "var(--u-color-bg)", padding: 16, borderRadius: 8 }}>
      <Card>
        <CardHeader eyebrow="North depot" title="Tour T-03" actions={<Badge tone="warning">2 stops late</Badge>} />
        <CardBody>
          <Text size="sm" tone="secondary">
            FP 214 K · Martin Hale · 14 stops · 86 km
          </Text>
        </CardBody>
      </Card>
    </div>
  );
}

export default function LightAndDark() {
  return (
    <Grid minItemWidth="240px" gap={4}>
      <Tour scheme="light" />
      <Tour scheme="dark" />
    </Grid>
  );
}
