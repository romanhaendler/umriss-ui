import { useState } from "react";
import { Button, Stack, Tag, TagGroup } from "../../../src";

export const title = "Remove tags from a group";
export const lead = "`onRemove` adds a remove button; in a `TagGroup` the arrow keys move between tags and focus lands on the neighbour after a removal.";

const INITIAL = ["Martin Hale", "Nadia Petrova", "Owen Carter"];

export default function Removable() {
  const [drivers, setDrivers] = useState(INITIAL);

  return (
    <Stack gap={3} align="flex-start">
      <TagGroup aria-label="Drivers on the early tours">
        {drivers.map((driver) => (
          <Tag key={driver} tone="accent" onRemove={() => setDrivers((all) => all.filter((d) => d !== driver))}>
            {driver}
          </Tag>
        ))}
        <Tag disabled onRemove={() => {}}>
          Lucia Romero (lead)
        </Tag>
      </TagGroup>
      {drivers.length < INITIAL.length && (
        <Button size="sm" onClick={() => setDrivers(INITIAL)}>
          Reset
        </Button>
      )}
    </Stack>
  );
}
