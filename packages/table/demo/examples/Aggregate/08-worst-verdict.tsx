import { KILN_LIMITS } from "@umriss-ui/demo/worlds/plant";
import { useTable } from "../../../src";

export const title = "Carry the worst verdict up";
export const lead = "On a `VerdictColumn`, `aggregate=\"worst\"` shows the worst verdict among a group's rows; fold a zone and its line still shows the alarm.";

interface Reading {
  id: string;
  kiln: string;
  zone: string;
  at: string;
  temperature: number | null;
}

const READINGS: Reading[] = [
  { id: "Z1-0600", kiln: "Kiln K1", zone: "Zone 1", at: "06:00", temperature: 1198.4 },
  { id: "Z1-0700", kiln: "Kiln K1", zone: "Zone 1", at: "07:00", temperature: 1201.2 },
  { id: "Z1-0800", kiln: "Kiln K1", zone: "Zone 1", at: "08:00", temperature: 1203.9 },
  { id: "Z2-0600", kiln: "Kiln K1", zone: "Zone 2", at: "06:00", temperature: 1209.5 },
  { id: "Z2-0700", kiln: "Kiln K1", zone: "Zone 2", at: "07:00", temperature: 1217.8 },
  { id: "Z2-0800", kiln: "Kiln K1", zone: "Zone 2", at: "08:00", temperature: 1212 },
  { id: "Z3-0600", kiln: "Kiln K1", zone: "Zone 3", at: "06:00", temperature: 1224.1 },
  { id: "Z3-0700", kiln: "Kiln K1", zone: "Zone 3", at: "07:00", temperature: 1233.6 },
  { id: "Z3-0800", kiln: "Kiln K1", zone: "Zone 3", at: "08:00", temperature: null },
];

export default function WorstVerdict() {
  const { Table, Column, VerdictColumn } = useTable(READINGS, { rowKey: (r) => r.id, defaultGrouping: ["kiln", "zone"] });
  return (
    <Table ariaLabel="Kiln temperature by zone">
      <Column value="zone" label="Zone" />
      <Column value="kiln" label="Kiln" />
      <Column value="at" label="Hour" rowHeader />
      <VerdictColumn value="temperature" label="Temperature (°C)" limits={KILN_LIMITS} format={{ decimals: 1 }} aggregate="worst" />
    </Table>
  );
}
