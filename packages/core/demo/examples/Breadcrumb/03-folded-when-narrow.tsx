import { Breadcrumb, Card, CardBody, Stack, Text } from "../../../src";

export const title = "Folded when narrow";

/* A long trail in a narrow place: the middle levels fold into a menu behind
   one key, from the root side - the first level and the ones next to the
   current page stay, because those are the ones a reader goes back to. The
   fold is measured, not guessed: the trail reads its own widths and folds only
   as many levels as it has to. The key opens a menu - the arrows walk it,
   Enter follows a level, Escape gives the focus back. */

const TRAIL = [
  { label: "Plant Nord", href: "#/breadcrumb" },
  { label: "Production", href: "#/breadcrumb" },
  { label: "Hall B", href: "#/breadcrumb" },
  { label: "Line 3", href: "#/breadcrumb" },
  { label: "Filler F1", href: "#/breadcrumb" },
  { label: "Valve block 2", href: "#/breadcrumb" },
  { label: "Valve 12" },
];

export default function FoldedWhenNarrow() {
  return (
    <Stack gap={4}>
      <Card style={{ width: 300 }}>
        <CardBody>
          <Stack gap={2}>
            <Text size="xs" tone="muted">
              300 pixels
            </Text>
            <Breadcrumb items={TRAIL} />
          </Stack>
        </CardBody>
      </Card>
      <Card style={{ width: 480 }}>
        <CardBody>
          <Stack gap={2}>
            <Text size="xs" tone="muted">
              480 pixels
            </Text>
            <Breadcrumb items={TRAIL} />
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
