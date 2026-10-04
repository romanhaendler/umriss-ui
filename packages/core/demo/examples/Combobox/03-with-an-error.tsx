import { useId, useState } from "react";
import { Combobox, Stack, Text } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the field invalid by itself. Without one, set `invalid` and tie your message to the field with `aria-describedby`.";

const VEHICLES = [
  { value: "v1", label: "FP 214 K, van, North depot" },
  { value: "v2", label: "FP 377 K, e-van, North depot" },
  { value: "v4", label: "FP 402 R, van, Riverside depot" },
];

export default function WithAnError() {
  const [vehicle, setVehicle] = useState<string | null>(null);
  const messageId = useId();
  const error = vehicle === null ? "Tour T-04 needs a vehicle before it can be released." : undefined;

  return (
    <Stack gap={1} style={{ maxWidth: 360 }}>
      <Combobox
        aria-label="Vehicle"
        value={vehicle}
        onChange={setVehicle}
        options={VEHICLES}
        placeholder="Choose a vehicle"
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
