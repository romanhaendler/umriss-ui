import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Export, Toolbar, useTable } from "../../../src";

export const title = "The text: onExport";

/* With `onExport` there is no file but the text - for an application that puts
   it on the clipboard, sends it to a service or builds a file of its own with
   its own name. The same text stands ready as `t.asCsv()`, without a button.

   Fields are separated by a semicolon, numbers stand with a decimal comma, and
   at the start stands a byte sequence by which a spreadsheet recognises
   UTF-8. */

interface Order {
  number: string;
  quantity: number;
  due: Date;
  urgent: boolean;
}

const ORDERS: Order[] = [
  { number: "A-2041", quantity: 120.5, due: new Date(Date.UTC(2026, 2, 20, 8)), urgent: false },
  { number: "A-2042", quantity: 48, due: new Date(Date.UTC(2026, 2, 24, 8)), urgent: true },
];

export default function AsText() {
  const [text, setText] = useState("Not exported yet.");
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Stack gap={3}>
      <Table ariaLabel="Orders">
        <Toolbar>
          <Export onExport={setText} />
        </Toolbar>
        <Column value="number" label="Order" rowHeader />
        <Column value="quantity" label="Quantity" />
        <Column value="due" label="Due" format="date" />
        <Column value="urgent" label="Urgent" />
      </Table>
      <Text as="pre" size="xs" mono>
        {text}
      </Text>
    </Stack>
  );
}
