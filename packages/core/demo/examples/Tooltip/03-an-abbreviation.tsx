import { Stack, Text, Tooltip } from "../../../src";

export const title = "Explain an abbreviation";
export const lead = "On text, make the element focusable with `tabIndex={0}` so a keyboard reader reaches the explanation too.";

/* Focusable text owes a visible focus: the library's ring, from its token. */
const STYLE = `
.abbreviation {
  text-decoration: underline dotted;
  cursor: help;
  border-radius: var(--u-radius-xs);
}
.abbreviation:focus-visible {
  outline: none;
  box-shadow: var(--u-focus-ring);
}
`;

export default function AnAbbreviation() {
  return (
    <Stack gap={1}>
      <style>{STYLE}</style>
      <Text size="xs" tone="muted">
        Checkout ·{" "}
        <Tooltip content="95th percentile: 95 of 100 requests were faster than this.">
          <span className="abbreviation" tabIndex={0}>
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
