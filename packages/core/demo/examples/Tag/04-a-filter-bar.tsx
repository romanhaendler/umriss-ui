import { useState } from "react";
import { Button, EmptyState, Select, Stack, Tag, TagGroup, Text } from "../../../src";

export const title = "Build a filter bar";
export const lead = "Each active filter is a removable tag; the list below follows them, and an empty result offers to clear them all.";

interface Shipment {
  id: string;
  customer: string;
  depot: string;
  status: "delivered" | "out for delivery" | "failed attempt";
}

const SHIPMENTS: Shipment[] = [
  { id: "SH-1042", customer: "Harlow Bakery", depot: "North depot", status: "delivered" },
  { id: "SH-1043", customer: "Pine & Oak Florist", depot: "North depot", status: "out for delivery" },
  { id: "SH-1051", customer: "Quayside Books", depot: "Riverside depot", status: "failed attempt" },
  { id: "SH-1052", customer: "Moreau Optics", depot: "Riverside depot", status: "out for delivery" },
  { id: "SH-1063", customer: "Linden Dental", depot: "East Gate depot", status: "delivered" },
];

type Filter = { key: "depot" | "status"; value: string };

const OPTIONS: Filter[] = [
  ...["North depot", "Riverside depot", "East Gate depot"].map((value) => ({ key: "depot" as const, value })),
  ...["delivered", "out for delivery", "failed attempt"].map((value) => ({ key: "status" as const, value })),
];

export default function AFilterBar() {
  const [filters, setFilters] = useState<Filter[]>([{ key: "depot", value: "North depot" }]);

  const shown = SHIPMENTS.filter((shipment) =>
    (["depot", "status"] as const).every((key) => {
      const wanted = filters.filter((f) => f.key === key).map((f) => f.value);
      return wanted.length === 0 || wanted.includes(shipment[key]);
    }),
  );

  return (
    <Stack gap={3} style={{ maxWidth: 560 }}>
      <Stack direction="row" gap={3} align="center" wrap>
        <Select
          selectSize="sm"
          aria-label="Add a filter"
          value=""
          onChange={(event) => {
            const picked = OPTIONS[Number(event.target.value)];
            if (picked && !filters.some((f) => f.value === picked.value)) setFilters([...filters, picked]);
          }}
          style={{ width: 200 }}
        >
          <option value="" disabled>
            Add a filter …
          </option>
          {OPTIONS.map((option, i) => (
            <option key={option.value} value={i}>
              {option.key === "depot" ? "Depot" : "Status"}: {option.value}
            </option>
          ))}
        </Select>
        <TagGroup aria-label="Active filters">
          {filters.map((filter) => (
            <Tag key={filter.value} tone="accent" onRemove={() => setFilters(filters.filter((f) => f !== filter))}>
              {filter.value}
            </Tag>
          ))}
        </TagGroup>
        {filters.length > 0 && (
          <Button size="sm" variant="ghost" onClick={() => setFilters([])}>
            Clear all
          </Button>
        )}
      </Stack>
      {shown.length === 0 ? (
        <EmptyState
          title="No shipments match"
          description="Remove a filter to see more."
          action={
            <Button size="sm" onClick={() => setFilters([])}>
              Clear the filters
            </Button>
          }
        />
      ) : (
        shown.map((shipment) => (
          <Stack key={shipment.id} direction="row" gap={3}>
            <Text as="span" size="sm" mono>
              {shipment.id}
            </Text>
            <Text as="span" size="sm" style={{ flex: 1 }}>
              {shipment.customer}
            </Text>
            <Text as="span" size="sm" tone="muted">
              {shipment.status}
            </Text>
          </Stack>
        ))
      )}
    </Stack>
  );
}
