import { useState } from "react";
import { Button, Stack, Tag, TagGroup, Text } from "../../../src";

export const title = "Remove tags from a group";
export const lead = "`onRemove` adds a remove button; in a `TagGroup` the arrow keys move between tags and focus lands on the neighbour after a removal. A tag whose content is more than text - the on-call mark - needs `removeLabel`, as no name for its button can be read from markup.";

const INITIAL = ["Martin Hale", "Nadia Petrova", "Owen Carter"];

export default function Removable() {
  const [drivers, setDrivers] = useState(INITIAL);
  const [standby, setStandby] = useState(true);

  return (
    <Stack gap={3} align="flex-start">
      <TagGroup aria-label="Drivers on the early tours">
        {drivers.map((driver) => (
          <Tag key={driver} tone="accent" onRemove={() => setDrivers((all) => all.filter((d) => d !== driver))}>
            {driver}
          </Tag>
        ))}
        {standby && (
          <Tag tone="accent" removeLabel="Remove Sven Berg (on call)" onRemove={() => setStandby(false)}>
            <Text as="span" size="xs" weight="semibold">
              On call
            </Text>{" "}
            Sven Berg
          </Tag>
        )}
        <Tag disabled onRemove={() => {}}>
          Lucia Romero (lead)
        </Tag>
      </TagGroup>
      {(drivers.length < INITIAL.length || !standby) && (
        <Button
          size="sm"
          onClick={() => {
            setDrivers(INITIAL);
            setStandby(true);
          }}
        >
          Reset
        </Button>
      )}
    </Stack>
  );
}
