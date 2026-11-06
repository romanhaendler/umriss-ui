import { Stack, Text, UmrissProvider } from "@umriss-ui/core";
import type { LanguageOptions } from "@umriss-ui/core";
import { ColumnGroup, ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Every column option in one head";
export const lead = "Left and right alignment (`numeric`), a list or a range `filter`, an automatic, `flex` or sized `width`, a `pin` to the start or the end, first, middle and last place, a `ColumnGroup` and a time column that carries its zone's name - the zone is the application's, not the reader's - in the regular and the compact density. Sort two columns to see the ranks beside the arrows.";

/* Outside the component: a provider that gets a new object on every render
   recomputes on every render. */
const LANGUAGE: LanguageOptions = { formats: { timeZone: "Pacific/Auckland" } };

interface Shipment {
  id: string;
  customer: string;
  city: string;
  weight: number;
  parcels: number;
  departs: Date;
  fee: number;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", customer: "Holloway Garden Supplies", city: "Leeds", weight: 412.5, parcels: 12, departs: new Date(Date.UTC(2026, 2, 16, 21, 30)), fee: 184.2 },
  { id: "FP-1004223", customer: "Oakridge Pharmacy", city: "Bristol", weight: 38, parcels: 2, departs: new Date(Date.UTC(2026, 2, 17, 6, 15)), fee: 41.9 },
  { id: "FP-1004236", customer: "Brixley Cycles", city: "Leeds", weight: 1260, parcels: 30, departs: new Date(Date.UTC(2026, 2, 17, 9, 0)), fee: 612 },
  { id: "FP-1004241", customer: "Nimbrel Software", city: "Cardiff", weight: 7.2, parcels: 1, departs: new Date(Date.UTC(2026, 2, 18, 14, 45)), fee: 12.5 },
];

function Shipments({ caption, density, menu }: { caption: string; density?: "regular" | "compact"; menu?: boolean }) {
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id });
  return (
    <Stack gap={2}>
      <Text size="xs" tone="muted">
        {caption}
      </Text>
      <Table density={density} aria-label={`Shipments, ${caption}`}>
        {menu && (
          <Toolbar>
            <ColumnMenu />
          </Toolbar>
        )}
        <Column value="id" label="Shipment" rowHeader pin="start" width={130} />
        <ColumnGroup label="Consignee">
          <Column value="customer" label="Customer" filter="list" flex={1} minWidth={160} />
          <Column value="city" label="City" />
        </ColumnGroup>
        <ColumnGroup label="Load">
          <Column value="weight" label="Weight (kg)" numeric filter="range" width={150} />
          <Column value="parcels" label="Parcels" numeric />
        </ColumnGroup>
        <ColumnGroup label="Dispatch">
          <Column value="departs" label="Departs" format="dateTime" filter="range" width={280} />
        </ColumnGroup>
        <ColumnGroup label="Charge">
          <Column value="fee" label="Fee (€)" numeric format={{ decimals: 2 }} pin="end" />
        </ColumnGroup>
      </Table>
    </Stack>
  );
}

export default function EveryColumnOption() {
  return (
    <UmrissProvider language={LANGUAGE}>
      <Stack gap={5}>
        <Shipments caption="Regular" menu />
        <Shipments caption='density="compact"' density="compact" />
      </Stack>
    </UmrissProvider>
  );
}
