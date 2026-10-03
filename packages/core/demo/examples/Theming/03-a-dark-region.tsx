import { Badge, Card, CardBody, CardHeader, Grid, Text } from "../../../src";

export const title = "A dark region";
export const lead =
  "The tokens follow the `color-scheme` an element inherits, and the library sets it nowhere: one element with `color-scheme: dark` makes everything inside it dark, on a light page too. The first tour follows the page; the second is always dark.";

/* The application's own switch is one CSS line, which its native controls
   need anyway:

     html.dark { color-scheme: dark; }
     :root { color-scheme: light dark; }  (or: follow the system)

   Nothing set means light. A region is the same line on its element:

     .dispatch-board { color-scheme: dark; background: var(--u-color-bg); } */
function Tour({ scheme }: { scheme?: "dark" }) {
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

export default function ADarkRegion() {
  return (
    <Grid minItemWidth="240px" gap={4}>
      <Tour />
      <Tour scheme="dark" />
    </Grid>
  );
}
