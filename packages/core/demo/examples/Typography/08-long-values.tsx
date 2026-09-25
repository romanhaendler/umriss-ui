import { Heading, Stack, Text } from "../../../src";

export const title = "Handle long values";
export const lead = "Text wraps and headings balance their lines; where one line is a must, clip it with CSS of your own and keep the whole value in `title`.";

const CUSTOMER = "Holloway Garden Supplies & Landscaping Wholesale, Unit 14, Riverside Trading Estate";
const REFERENCE = "SH-1042/FP214K/2026-03-17T10:30:00Z/attempt-2";

export default function LongValues() {
  return (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <Heading level={4}>{CUSTOMER}</Heading>
      <Text size="sm" mono style={{ overflowWrap: "anywhere" }}>
        {REFERENCE}
      </Text>
      <Text
        size="sm"
        tone="secondary"
        title={CUSTOMER}
        style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {CUSTOMER}
      </Text>
    </Stack>
  );
}
