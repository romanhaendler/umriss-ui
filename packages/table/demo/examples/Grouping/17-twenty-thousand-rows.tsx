import { useMemo } from "react";
import { useTable } from "../../../src";

export const title = "Group twenty thousand rows";
export const lead = "Grouping works with `virtual`: the window counts header rows and rows alike, and headers stick one below the other while their group scrolls.";

interface Request {
  id: string;
  service: string;
  at: Date;
  duration: number;
  size: number;
}

const SERVICES = ["Checkout", "Billing", "Sign-in", "Search", "Image service", "Notifications", "Webhooks", "Reporting"] as const;

/* mulberry32: the same seed yields the same requests on every run. */
function generate(count: number): Request[] {
  let seed = 20260317;
  const next = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  /* Three days, one request every thirteen seconds, in the order they came. */
  const start = new Date(2026, 2, 15, 6).getTime();
  return Array.from({ length: count }, (_, i) => ({
    id: `r${i}`,
    service: SERVICES[Math.floor(next() * SERVICES.length)]!,
    at: new Date(start + i * 13_000),
    duration: Math.round(20 + next() * 900),
    size: Math.round(next() * 5000) / 10,
  }));
}

/* The part of the day a request came in - a key, not a column. */
const partOf = (d: Date) => (d.getHours() < 6 ? "Night" : d.getHours() < 12 ? "Morning" : d.getHours() < 18 ? "Afternoon" : "Evening");

export default function TwentyThousand() {
  const requests = useMemo(() => generate(20_000), []);
  const { Table, Column, GroupBy } = useTable(requests, {
    rowKey: (r) => r.id,
    defaultGrouping: ["service", "part"],
    virtual: { rowHeight: 37 },
  });
  return (
    <Table ariaLabel="Requests" maxHeight="480px" stickyHeader>
      <Column value="service" label="Service" />
      <Column value="at" label="Received" format="dateTime" aggregate="range" />
      <Column value="duration" label="Duration (ms)" format={{ decimals: 0 }} aggregate="avg" />
      <Column value="size" label="Size (kB)" format={{ decimals: 1 }} aggregate="max" />
      <GroupBy id="part" value={(r) => partOf(r.at)} label="Part of the day" />
    </Table>
  );
}
