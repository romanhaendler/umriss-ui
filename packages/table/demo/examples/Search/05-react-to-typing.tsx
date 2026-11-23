import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "React to typing";
export const lead = "`onValueChange` on `Search` reports the text as it is typed, beside the search itself; here it shows what the user is looking for.";

interface Person {
  name: string;
  role: string;
}

const PEOPLE: Person[] = [
  { name: "Maya Lindgren", role: "Product manager" },
  { name: "Arjun Mehta", role: "Developer" },
  { name: "Noah Fischer", role: "Designer" },
];

export default function ReactToTyping() {
  const [typed, setTyped] = useState("");
  const { Table, Column } = useTable(PEOPLE, { rowKey: (p) => p.name });

  return (
    <Stack gap={3}>
      <Table aria-label="People">
        <Toolbar>
          <Search placeholder="Search people" onValueChange={setTyped} />
        </Toolbar>
        <Column value="name" label="Name" rowHeader />
        <Column value="role" label="Role" />
      </Table>
      <Text size="sm" tone="secondary">
        {typed === "" ? "Nothing typed yet" : `Looking for “${typed}”`}
      </Text>
    </Stack>
  );
}
