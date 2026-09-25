import { Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Sticky header, sticky row header";

/* `stickyHeader` holds the header row during a vertical scroll,
   `stickyRowHeader` the column that names the row during a sideways one -
   behind the selection and the expander, which stick along with it.

   `stickyRowHeader` is `pin="start"` on the row header (Column, "Pinned to both
   sides"): it stands in front even though it stands second in the JSX - a
   sticky column in the middle would travel over its neighbours while
   scrolling. Column menu and export show the same order.

   The hour columns come into being with `map` - columns are elements, and a
   computed value needs an `id`.

   `width` is an initial width, not a minimum width: a table over the full width
   distributes the space it has. So that there is something to scroll sideways,
   it gets a minimum width here from the application's stylesheet. */

const STYLE = `
.hours-table table {
  min-width: 1400px;
}
`;

const HOURS = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

interface Station {
  id: string;
  station: string;
  line: string;
  shiftLead: string;
  pieces: number[];
}

const NAMES = ["Saw", "Mill", "Lathe", "Boring mill", "Grinding", "Deburring", "Washing", "Inspection"];
const LEADS = ["M. Weber", "J. Fontaine", "A. Novak", "K. Tanaka"];

const STATIONS: Station[] = Array.from({ length: 16 }, (_, i) => ({
  id: `s${i + 1}`,
  station: `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`,
  line: `Line ${(i % 3) + 1}`,
  shiftLead: LEADS[i % LEADS.length]!,
  pieces: HOURS.map((_, h) => 40 + ((i * 7 + h * 13) % 37)),
}));

export default function StickyParts() {
  const { Table, Column, RowDetail } = useTable(STATIONS, { rowKey: (s) => s.id });

  return (
    <>
      <style>{STYLE}</style>
      <Table
        className="hours-table"
        selectable
        stickyHeader
        stickyRowHeader
        maxHeight="300px"
        ariaLabel="Pieces per hour"
      >
        <Column value="line" label="Line" width={96} />
        <Column value="station" label="Station" rowHeader width={150} />
        {HOURS.map((hour, h) => (
          <Column key={hour} id={hour} label={hour} value={(s) => s.pieces[h]} width={96} />
        ))}
        <RowDetail>
          {(s) => (
            <Text size="sm">
              {s.station}, {s.line} – shift lead {s.shiftLead}
            </Text>
          )}
        </RowDetail>
      </Table>
    </>
  );
}
