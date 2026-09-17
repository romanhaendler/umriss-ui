import { Link, Stack, Text } from "../../../src";

export const title = "Mono, tracking and links";

/* `mono` is Geist Mono with tabular figures: numbers underneath one another
   then really do line up. Tracking and line height are steps of their own,
   because they have jobs of their own - letter-spaced capitals and multi-line
   labels need different things.

   `external` opens in a new tab and says so to the screen reader. */
export default function MonoAndLinks() {
  return (
    <Stack gap={3}>
      <Text mono size="sm">
        1.008.000,00 €
      </Text>
      <Text mono size="sm">
        A-2041-KX
      </Text>
      <Text size="xs" tracking="caps" tone="muted">
        Letter-spaced capitals
      </Text>
      <Text size="lg" tracking="display">
        Large titles run compressed
      </Text>
      <Text size="sm" leading="tight" tone="secondary">
        A tight line height for multi-line labels, where the line spacing is meant to carry what
        belongs together.
      </Text>
      <Text size="sm">
        A <Link href="#/typography">link in the body text</Link> and an{" "}
        <Link href="https://example.org" external>
          external one
        </Link>
        , which opens in a new tab.
      </Text>
    </Stack>
  );
}
