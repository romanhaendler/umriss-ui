import { Stack, Text, Tooltip } from "../../../src";

export const title = "Explain an abbreviation";
export const lead = "On text, make the element focusable with `tabIndex={0}` so a keyboard reader reaches the explanation too.";

export default function AnAbbreviation() {
  return (
    <Stack gap={1}>
      <Text size="xs" tone="muted">
        Checkout ·{" "}
        <Tooltip content="95th percentile: 95 of 100 requests were faster than this.">
          <span tabIndex={0} style={{ textDecoration: "underline dotted", cursor: "help" }}>
            p95
          </span>
        </Tooltip>{" "}
        latency
      </Text>
      <Text size="xl" mono>
        412 ms
      </Text>
    </Stack>
  );
}
