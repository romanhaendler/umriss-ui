import { useTable } from "../../../src";
import { DRIVERS, TOURS } from "@umriss-ui/demo/worlds/logistics";
import type { Tour } from "@umriss-ui/demo/worlds/logistics";

export const title = "Show the stops of a tour";

export const lead = "A detail can hold a table of its own – give it a component, since `useTable` is a hook and the detail a plain function.";

const time = (t: number) => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function Stops({ tour }: { tour: Tour }) {
  const { Table, Column } = useTable(tour.stops, { rowKey: (s) => s.id });
  return (
    <Table density="compact" ariaLabel={`Stops of ${tour.id}`}>
      <Column value="shipment" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <Column id="window" label="Window" value={(s) => `${time(s.window[0])}–${time(s.window[1])}`} />
      <Column id="arrival" label="Arrival" value={(s) => time(s.arrival)} />
    </Table>
  );
}

export default function StopsOfATour() {
  const { Table, Column, RowDetail } = useTable(TOURS, { rowKey: (t) => t.id });

  return (
    <Table ariaLabel="Tours">
      <Column value="id" label="Tour" rowHeader />
      <Column id="driver" label="Driver" value={(t) => DRIVERS.find((d) => d.id === t.driver)?.name ?? t.driver} />
      <Column id="stops" label="Stops" value={(t) => t.stops.length} />
      <Column value="km" label="Distance (km)" />
      <RowDetail>{(t) => <Stops tour={t} />}</RowDetail>
    </Table>
  );
}
