import { useRef, useState } from "react";
import { Button, FormField, Popover, SegmentedControl, Stack, Text } from "../../../src";

export const title = "A setting in a panel";
export const lead = "A panel whose first control is a choice opens with the focus on the chosen option, the one Tab would reach, so Space confirms what is shown and changes nothing.";

export default function ASettingInAPanel() {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [density, setDensity] = useState("spacious");

  return (
    <Stack gap={3} align="flex-start">
      <Button ref={anchor} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Density
      </Button>
      <Popover open={open} onOpenChange={setOpen} anchorRef={anchor} role="dialog" aria-label="Density" restoreFocus width={320}>
        <Stack gap={3} style={{ padding: "var(--u-space-4)" }}>
          <FormField label="Row density">
            <SegmentedControl
              fill
              value={density}
              onChange={setDensity}
              options={[
                { value: "compact", label: "Compact" },
                { value: "regular", label: "Regular" },
                { value: "spacious", label: "Spacious" },
              ]}
            />
          </FormField>
        </Stack>
      </Popover>
      <Text size="sm">Density: {density}</Text>
    </Stack>
  );
}
