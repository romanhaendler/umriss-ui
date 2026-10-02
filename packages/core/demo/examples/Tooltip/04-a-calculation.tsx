import { Text, Tooltip } from "../../../src";

export const title = "Show how a figure came about";
export const lead = "The content may be built from `Text`: inside a tooltip every tone turns round and reads on the tooltip's ground.";

/* Focusable text owes a visible focus: the library's ring, from its token. */
const STYLE = `
.figure {
  cursor: help;
  border-radius: var(--u-radius-xs);
}
.figure:focus-visible {
  outline: none;
  box-shadow: var(--u-focus-ring);
}
`;

export default function ACalculation() {
  return (
    <>
      <style>{STYLE}</style>
      <Tooltip
        content={
          <>
            <Text size="xs" mono>
              3 × 12.50 € = 37.50 €
            </Text>
            <Text size="xs" tone="muted">
              Quantity × unit price
            </Text>
          </>
        }
      >
        <Text as="span" size="xl" mono className="figure" tabIndex={0}>
          37.50 €
        </Text>
      </Tooltip>
    </>
  );
}
