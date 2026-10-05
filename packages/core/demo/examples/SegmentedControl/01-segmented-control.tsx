import { useState } from "react";
import { SegmentedControl, Text, Stack } from "../../../src";

export const title = "Segmented control";
export const lead = "Pass `options`, `value` and `onChange`; `value` is `null` until something is chosen.";

export default function SegmentedControlExample() {
  const [period, setPeriod] = useState<"shift" | "day" | "week" | null>("day");

  return (
    <Stack gap={3} align="flex-start">
      <SegmentedControl
        aria-label="Period"
        value={period}
        onChange={setPeriod}
        options={[
          { value: "shift", label: "Shift" },
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
        ]}
      />
      <Text size="xs" tone="muted" mono>
        period: {period ?? "none"}
      </Text>
    </Stack>
  );
}
