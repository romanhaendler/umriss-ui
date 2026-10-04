import { useId, useState } from "react";
import { NumberInput, Stack, Text } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the field invalid by itself. Without one, set `invalid` and tie your message to the field with `aria-describedby`.";

export default function WithAnError() {
  const [quantity, setQuantity] = useState<number | null>(0);
  const messageId = useId();
  const error = quantity === null || quantity < 1 ? "An invoice line needs at least one unit." : undefined;

  return (
    <Stack gap={1} style={{ maxWidth: 280 }}>
      <NumberInput
        aria-label="Quantity"
        value={quantity}
        onChange={setQuantity}
        min={0}
        decimals={0}
        invalid={error !== undefined}
        aria-describedby={error ? messageId : undefined}
      />
      {error && (
        <Text id={messageId} size="xs" style={{ color: "var(--u-color-danger-text)" }}>
          {error}
        </Text>
      )}
    </Stack>
  );
}
