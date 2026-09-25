import { useState } from "react";
import { Button, EmptyState, Stack, Tag, TagGroup, Text } from "../../../src";

export const title = "Say why a filter found nothing";
export const lead = "When filters empty a list, name them in the `description` and offer to clear them – the data is there, the view hides it.";

/** Today's shipments from East Gate depot. */
const SHIPMENTS = [
  { id: "SH-1042", customer: "Harlow Bakery", status: "delivered" },
  { id: "SH-1043", customer: "Pine & Oak Florist", status: "out for delivery" },
  { id: "SH-1044", customer: "Moreau Optics", status: "delivered" },
];

export default function AFilterFoundNothing() {
  const [filters, setFilters] = useState(["Failed attempt", "East Gate depot"]);
  const shown = filters.includes("Failed attempt") ? [] : SHIPMENTS;

  return (
    <Stack gap={3}>
      <TagGroup aria-label="Active filters">
        {filters.map((filter) => (
          <Tag key={filter} tone="accent" onRemove={() => setFilters((all) => all.filter((f) => f !== filter))}>
            {filter}
          </Tag>
        ))}
      </TagGroup>
      {shown.length === 0 ? (
        <EmptyState
          title="No shipments match these filters"
          description={`Nothing today matches ${filters.map((f) => `“${f}”`).join(" and ")}.`}
          action={
            <Button size="sm" onClick={() => setFilters([])}>
              Clear the filters
            </Button>
          }
        />
      ) : (
        shown.map((shipment) => (
          <Text key={shipment.id} size="sm">
            {shipment.id} · {shipment.customer} · {shipment.status}
          </Text>
        ))
      )}
    </Stack>
  );
}
