import { Stack, Text, VisuallyHidden } from "../../../src";

export const title = "Add a skip link";
export const lead = "Render it as a link with `focusable`: it is the first Tab stop on the page and shows itself only while it has focus.";

export default function SkipLink() {
  return (
    <Stack gap={2} align="flex-start">
      <VisuallyHidden as="a" href="#shipments" focusable>
        Skip to the shipment list
      </VisuallyHidden>
      <Text size="sm" tone="secondary">
        Tab into this example: the link appears above this line.
      </Text>
    </Stack>
  );
}
