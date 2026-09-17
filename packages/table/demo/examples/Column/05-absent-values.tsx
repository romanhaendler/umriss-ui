import { useFormats } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Absent values";

/* `null`, `undefined` and `NaN` are an absent value - not zero and not the
   empty string. The cell shows a muted dash, and a screen reader hears "no
   value".

   `children` is never called for it, and that is why `value` is typed without
   `null`: no check in every cell. When sorting, an absent value stands last in
   either direction, and it does not count towards the average - three
   measurements make an average out of three. */

interface Measurement {
  sample: string;
  diameter: number | null;
}

const MEASUREMENTS: Measurement[] = [
  { sample: "P-01", diameter: 32.02 },
  { sample: "P-02", diameter: null },
  { sample: "P-03", diameter: 31.97 },
  { sample: "P-04", diameter: Number.NaN },
  { sample: "P-05", diameter: 32.05 },
];

export default function AbsentValues() {
  const formats = useFormats();
  const { Table, Column } = useTable(MEASUREMENTS, { rowKey: (m) => m.sample });

  return (
    <Table ariaLabel="Measurements">
      <Column value="sample" label="Sample" rowHeader />
      <Column value="diameter" label="Diameter" footer="avg">
        {(mm) => `${formats.number(mm, 2)} mm`}
      </Column>
    </Table>
  );
}
