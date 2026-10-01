import { useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { DateRangePicker, Input, MultiSelect, Select, Stack, Switch, Text } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "A row that holds still";
export const lead =
  "In a row a field is its natural width - sixteen characters of its type - and never what it shows. Choose carriers, clear them, pick the long status: nothing in the row moves. The chips that do not fit stand as \"+N\", and the figures below are the fields' widths, measured live.";

const CARRIERS = ["DHL", "UPS", "DPD", "GLS", "Hermes", "FedEx", "TNT", "DB Schenker", "Kühne + Nagel", "Dachser"].map(
  (name) => ({ value: name, label: name }),
);

/** The rendered width of an element, kept up to date. */
function useWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(Math.round(element.getBoundingClientRect().width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

export default function ARowThatHoldsStill() {
  const [search, setSearch] = useState("");
  const [carriers, setCarriers] = useState<string[]>(["DHL", "UPS", "GLS"]);
  const [period, setPeriod] = useState<DateRange | null>(null);
  const carriersRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const carriersWidth = useWidth(carriersRef);
  const statusWidth = useWidth(statusRef);

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center" wrap>
        <Input
          aria-label="Search shipments"
          placeholder="Search shipments"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          clearable
          onClear={() => setSearch("")}
        />
        <Select ref={statusRef} aria-label="Status" defaultValue="">
          <option value="">Every status</option>
          <option>Out for delivery</option>
          <option>Held at customs until the papers of origin are checked</option>
        </Select>
        <MultiSelect ref={carriersRef} aria-label="Carriers" placeholder="Every carrier" options={CARRIERS} value={carriers} onChange={setCarriers} />
        <DateRangePicker aria-label="Shipped" value={period} onChange={setPeriod} clearable />
        <Switch label="Late only" />
      </Stack>
      <Text size="xs" tone="muted" mono>
        carriers: {carriers.length} chosen, {carriersWidth} px wide · status: {statusWidth} px wide
      </Text>
    </Stack>
  );
}
