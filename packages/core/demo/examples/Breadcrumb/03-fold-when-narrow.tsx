import { Breadcrumb, Card, CardBody, Stack, Text } from "../../../src";

export const title = "Fold when narrow";
export const lead = "A long trail in a narrow place folds its middle levels into a menu, measured, keeping the first level and the current page.";

const TRAIL = [
  { label: "Quillmere", href: "#/breadcrumb" },
  { label: "Services", href: "#/breadcrumb" },
  { label: "Payments", href: "#/breadcrumb" },
  { label: "Checkout", href: "#/breadcrumb" },
  { label: "Incidents", href: "#/breadcrumb" },
  { label: "INC-1048", href: "#/breadcrumb" },
  { label: "Timeline" },
];

export default function FoldWhenNarrow() {
  return (
    <Stack gap={4}>
      {[300, 480].map((width) => (
        <Card key={width} style={{ width }}>
          <CardBody>
            <Stack gap={2}>
              <Text size="xs" tone="muted">
                {width} pixels
              </Text>
              <Breadcrumb items={TRAIL} />
            </Stack>
          </CardBody>
        </Card>
      ))}
    </Stack>
  );
}
