import { useTable } from "../../../src";

export const title = "The footer renamed";

/* Until the table could group, the prop was called `footer`. It is called
   `aggregate` now, because the same value also stands in a group's band. The
   old name still works for one more minor version and says so once in the
   console during development; the two together do not compile.

     <Column value="hours" label="Hours" footer="sum" />     // before
     <Column value="hours" label="Hours" aggregate="sum" />  // now */

interface Booking {
  id: string;
  employee: string;
  project: string;
  hours: number;
}

const BOOKINGS: Booking[] = [
  { id: "B-301", employee: "M. Keller", project: "Retrofit hall 2", hours: 7.5 },
  { id: "B-302", employee: "S. Arslan", project: "Retrofit hall 2", hours: 8 },
  { id: "B-303", employee: "M. Keller", project: "PLC migration", hours: 4.25 },
  { id: "B-304", employee: "J. Brandt", project: "PLC migration", hours: 6 },
];

export default function FooterRenamed() {
  const { Table, Column } = useTable(BOOKINGS, { rowKey: (b) => b.id });
  return (
    <Table ariaLabel="Time bookings">
      <Column value="id" label="Booking" rowHeader />
      <Column value="employee" label="Employee" />
      <Column value="project" label="Project" />
      <Column value="hours" label="Hours" format={{ decimals: 2 }} aggregate="sum" />
    </Table>
  );
}
