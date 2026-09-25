import { Heading, Link, Stack, Text } from "../../../src";

export const title = "Text, heading and link";
export const lead = "A heading, a paragraph and a link in it, each at its default: the base of every surface.";

export default function TextHeadingLink() {
  return (
    <Stack gap={2}>
      <Heading level={3}>Checkout</Heading>
      <Text>
        Takes card and wallet payments for every booking. Owned by the Payments team;{" "}
        <Link href="#/typography">see the on-call rota</Link>.
      </Text>
    </Stack>
  );
}
