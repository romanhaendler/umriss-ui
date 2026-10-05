import { FormField, SegmentedControl, Stack } from "../../../src";

export const title = "States and sizes";
export const lead =
  "`size` is `md` or `sm`; a `ControlSizeProvider` sets it for a place. `disabled` closes the whole control, `disabled` on an option closes that possibility and leaves it in view - the arrow keys skip it.";

const PERIODS = [
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
] as const;

export default function StatesAndSizes() {
  return (
    <Stack direction="row" gap={5} wrap>
      <FormField label="Medium">
        <SegmentedControl defaultValue="day" options={PERIODS} />
      </FormField>
      <FormField label="Small">
        <SegmentedControl size="sm" defaultValue="day" options={PERIODS} />
      </FormField>
      <FormField label="Disabled">
        <SegmentedControl disabled defaultValue="day" options={PERIODS} />
      </FormField>
      <FormField label="One possibility closed" hint="No forecast for this line yet.">
        <SegmentedControl
          defaultValue="measured"
          options={[
            { value: "measured", label: "Measured" },
            { value: "forecast", label: "Forecast", disabled: true },
          ]}
        />
      </FormField>
    </Stack>
  );
}
