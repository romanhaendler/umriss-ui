import { useState } from "react";
import { Grid, Input, Select, Stack, Text } from "../../../src";

export const title = "A bar with a search";
export const lead =
  "A field does not grow to fill a row; a bar of one's own says which one takes the rest. In a grid, a field fills its cell: the search is the \"fill\" column, the selects beside it keep a width of their own, and nothing is styled by hand.";

const ROWS = [
  { name: "Invoice 1042", status: "Open", region: "North" },
  { name: "Invoice 1043", status: "Paid", region: "South" },
  { name: "Invoice 1044", status: "Open", region: "South" },
  { name: "Invoice 1045", status: "Overdue", region: "North" },
];

export default function ABarWithASearch() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [region, setRegion] = useState("");
  const shown = ROWS.filter(
    (row) =>
      row.name.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!status || row.status === status) &&
      (!region || row.region === region),
  );
  return (
    <Stack gap={3}>
      <Grid columns={["fill", 180, 180]} gap={3}>
        <Input
          type="search"
          aria-label="Search"
          placeholder="Search invoices"
          value={search}
          onValueChange={setSearch}
        />
        <Select aria-label="Status" value={status} onValueChange={(value) => setStatus(value ?? "")}>
          <option value="">Any status</option>
          <option>Open</option>
          <option>Paid</option>
          <option>Overdue</option>
        </Select>
        <Select aria-label="Region" value={region} onValueChange={(value) => setRegion(value ?? "")}>
          <option value="">Any region</option>
          <option>North</option>
          <option>South</option>
        </Select>
      </Grid>
      <Text size="sm" tone="secondary">
        {shown.length} of {ROWS.length} invoices: {shown.map((row) => row.name).join(", ") || "none"}
      </Text>
    </Stack>
  );
}
