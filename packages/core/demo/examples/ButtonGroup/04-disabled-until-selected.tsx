import { useState } from "react";
import { Checkbox, MenuItem, SplitButton, Stack } from "../../../src";

export const title = "Disable while nothing is selected";
export const lead = "Set `disabled` on the split button and both halves lock: the main action and its menu wait for a selection.";

const SHIPMENTS = [
  { id: "SH-1042", customer: "Holloway Garden Supplies" },
  { id: "SH-1043", customer: "Marlow & Finch Books" },
  { id: "SH-1044", customer: "Oakridge Pharmacy" },
];

export default function DisabledUntilSelected() {
  const [selected, setSelected] = useState<readonly string[]>([]);
  const toggle = (id: string) =>
    setSelected((now) => (now.includes(id) ? now.filter((one) => one !== id) : [...now, id]));

  return (
    <Stack gap={3} align="flex-start">
      {SHIPMENTS.map((shipment) => (
        <Checkbox
          key={shipment.id}
          label={`${shipment.id} · ${shipment.customer}`}
          checked={selected.includes(shipment.id)}
          onChange={() => toggle(shipment.id)}
        />
      ))}
      <SplitButton
        size="sm"
        disabled={selected.length === 0}
        onClick={() => setSelected([])}
        menu={
          <>
            <MenuItem onSelect={() => setSelected([])}>Reschedule for tomorrow</MenuItem>
            <MenuItem onSelect={() => setSelected([])}>Return to sender</MenuItem>
          </>
        }
      >
        {selected.length === 0 ? "Rebook" : `Rebook ${selected.length}`}
      </SplitButton>
    </Stack>
  );
}
