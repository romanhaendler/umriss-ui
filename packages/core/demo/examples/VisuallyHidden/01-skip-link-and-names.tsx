import { Button, Stack, Text, VisuallyHidden } from "../../../src";

export const title = "A skip link and an accessible name";

/* Two cases, one component. `focusable` makes the content visible as soon as it
   takes focus - that is how a skip link works: not there for the eye, the first
   stop on the page for the tab key.

   Without `focusable` the text stays invisible and extends the name a screen
   reader reads out. "Delete" on its own is no information in a list of twenty
   rows. */
export default function SkipLinkAndNames() {
  return (
    <Stack gap={3} align="flex-start">
      <VisuallyHidden as="a" href="#content" focusable>
        Skip to the content
      </VisuallyHidden>
      <Button size="sm">
        Delete
        <VisuallyHidden>&nbsp;- project Aurora, permanently</VisuallyHidden>
      </Button>
      <Text size="xs" tone="muted">
        For the eye the button is called "Delete", for the screen reader "Delete - project Aurora,
        permanently". The skip link above it becomes visible as soon as it takes focus.
      </Text>
    </Stack>
  );
}
