import type { LimitSet } from "@umriss-ui/core";
import { ColumnMenu, Export, Search, Toolbar, useTable } from "../../../src";

export const title = "The shift report, worked through";

/* Everything at once, as a shift lead reads the day: lots by line and shift.
   The shift is a group key derived from the start time. Each band carries the
   pieces with its share bar, the scrap rate weighted by pieces - an aggregate
   of one's own, never an average of rates -, how many different articles ran,
   and the worst verdict of the spindle load. Select a shift to put its lots on
   hold; the export stays flat, one line per lot, for the spreadsheet. */

interface Lot {
  lot: string;
  line: string;
  started: Date;
  article: string;
  pieces: number;
  scrap: number;
  load: number | null;
}

const at = (d: number, h: number, m = 0) => new Date(2026, 8, d, h, m);

const LOTS: Lot[] = [
  { lot: "L-7701", line: "Line 1", started: at(24, 6, 10), article: "Housing 40", pieces: 1200, scrap: 14, load: 71 },
  { lot: "L-7702", line: "Line 1", started: at(24, 9, 40), article: "Housing 60", pieces: 800, scrap: 3, load: 64 },
  { lot: "L-7703", line: "Line 1", started: at(24, 14, 5), article: "Cover plate", pieces: 2400, scrap: 31, load: 88 },
  { lot: "L-7704", line: "Line 1", started: at(24, 18, 30), article: "Housing 40", pieces: 600, scrap: 0, load: 59 },
  { lot: "L-7705", line: "Line 1", started: at(24, 22, 15), article: "Flange", pieces: 300, scrap: 2, load: null },
  { lot: "L-7706", line: "Line 2", started: at(24, 6, 0), article: "Shaft 12", pieces: 5000, scrap: 62, load: 93 },
  { lot: "L-7707", line: "Line 2", started: at(24, 11, 20), article: "Shaft 16", pieces: 3200, scrap: 18, load: 82 },
  { lot: "L-7708", line: "Line 2", started: at(24, 15, 45), article: "Shaft 12", pieces: 1500, scrap: 4, load: 67 },
  { lot: "L-7709", line: "Line 2", started: at(25, 1, 30), article: "Bushing", pieces: 900, scrap: 1, load: 55 },
  { lot: "L-7710", line: "Line 3", started: at(24, 7, 15), article: "Bracket", pieces: 700, scrap: 9, load: 61 },
  { lot: "L-7711", line: "Line 3", started: at(24, 16, 50), article: "Bracket L", pieces: 450, scrap: 0, load: 58 },
  { lot: "L-7712", line: "Line 3", started: at(24, 23, 40), article: "Bracket", pieces: 1100, scrap: 27, load: 84 },
];

const LOAD: LimitSet = {
  limits: [
    { value: 80, side: "upper", severity: "warning" },
    { value: 90, side: "upper", severity: "alarm" },
  ],
};

const shiftOf = (d: Date) => (d.getHours() < 6 || d.getHours() >= 22 ? "Night" : d.getHours() < 14 ? "Early" : "Late");

/* Scrap over pieces, summed first: a lot of 5,000 weighs more than one of 300.
   In per cent with two decimals - whole per cent would hide the difference. */
const weighted = (_values: readonly number[], lots: readonly Lot[]) =>
  (100 * lots.reduce((s, l) => s + l.scrap, 0)) / lots.reduce((s, l) => s + l.pieces, 0);

export default function ShiftReport() {
  const { Table, Column, VerdictColumn, GroupBy, RowActions, Action } = useTable(LOTS, {
    rowKey: (l) => l.lot,
    defaultGrouping: ["line", "shift"],
  });
  return (
    <Table ariaLabel="Shift report" selectable stickyHeader maxHeight="560px">
      <Toolbar>
        <Search />
        <ColumnMenu />
        <Export filename="shift-report.csv" />
      </Toolbar>
      <GroupBy id="shift" value={(l) => shiftOf(l.started)} label="Shift" />
      <Column value="lot" label="Lot" rowHeader />
      <Column value="line" label="Line" />
      <Column value="started" label="Started" format="time" />
      <Column value="article" label="Article" aggregate="distinct" />
      <Column value="pieces" label="Pieces" format="count" aggregate="sum" />
      <Column id="rate" value={(l) => (100 * l.scrap) / l.pieces} label="Scrap rate (%)" format={{ decimals: 2 }} aggregate={weighted} />
      <VerdictColumn value="load" label="Spindle load (%)" limits={LOAD} aggregate="worst" />
      <RowActions>
        <Action bulk onSelect={(lots) => window.alert(`On hold: ${lots.map((l) => l.lot).join(", ")}`)}>
          Put on hold
        </Action>
      </RowActions>
    </Table>
  );
}
