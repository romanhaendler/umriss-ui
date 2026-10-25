import { DataTable, Legend, Tooltip, useChart } from "../../../src";

export const title = "Read a stack's total in the table";
export const lead = "The table of a stacked chart ends the stack's members with a Total column - the sum the tooltip shows at the same place, so nobody adds the row up by hand.";

/* Support tickets opened per working day, by channel - one week, 2 to 6 March. */
const TICKETS = [
  { day: "Mon 2", mail: 34, chat: 21, phone: 9 },
  { day: "Tue 3", mail: 29, chat: 25, phone: 12 },
  { day: "Wed 4", mail: 31, chat: 18, phone: 7 },
  { day: "Thu 5", mail: 27, chat: 30, phone: 11 },
  { day: "Fri 6", mail: 22, chat: 16, phone: 6 },
];

export default function TotalOfAStack() {
  const { Chart, XAxis, YAxis, Bar } = useChart(TICKETS);
  return (
    <Chart height={260} aria-label="Tickets opened per working day, by channel">
      <XAxis value="day" />
      <YAxis label="Tickets" />
      <Bar value="mail" name="Mail" stack="tickets" />
      <Bar value="chat" name="Chat" stack="tickets" />
      <Bar value="phone" name="Phone" stack="tickets" />
      <Legend placement="top" />
      <Tooltip mode="x" />
      <DataTable />
    </Chart>
  );
}
