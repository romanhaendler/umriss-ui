import { Button, Card, CardBody, CardHeader, Input, Stack, Text } from "@umriss-ui/core";
import { Pagination, useTable } from "../../../src";
import type { TableRef } from "../../../src";

export const title = "Search and page from a header of your own";
export const lead = "`t.search` and `t.setSearch` bind a field of the application's own, `t.page` and `t.setPage` a pager in the card's header. The table pages only while a `Pagination` stands in it; both pagers move the same page.";

interface Service {
  id: string;
  name: string;
  team: string;
  tier: number;
}

const SERVICES: Service[] = [
  { id: "checkout", name: "Checkout", team: "Payments", tier: 1 },
  { id: "billing", name: "Billing", team: "Payments", tier: 1 },
  { id: "refunds", name: "Refunds", team: "Payments", tier: 2 },
  { id: "sign-in", name: "Sign-in", team: "Identity", tier: 1 },
  { id: "accounts", name: "Accounts", team: "Identity", tier: 2 },
  { id: "search", name: "Search", team: "Discovery", tier: 1 },
  { id: "recommendations", name: "Recommendations", team: "Discovery", tier: 3 },
  { id: "catalogue", name: "Catalogue", team: "Discovery", tier: 2 },
  { id: "notifications", name: "Notifications", team: "Messaging", tier: 2 },
  { id: "webhooks", name: "Webhooks", team: "Messaging", tier: 3 },
  { id: "image-service", name: "Image service", team: "Platform", tier: 2 },
  { id: "reporting", name: "Reporting", team: "Platform", tier: 3 },
];

/* Written once for every table of the application, so it takes the table as
   `of`, as the package's own parts do. It says which rows stand on the page,
   out of how many: `rowCount` is what the search leaves, `rows` all there are.
   A table that scrolls instead of paging has no page to step through. */
function RangePager({ of }: { of: TableRef }) {
  if (of.virtual || of.rowCount === 0) return null;
  const first = (of.page - 1) * of.pageSize + 1;
  const last = Math.min(of.page * of.pageSize, of.rowCount);
  return (
    <Stack direction="row" gap={1} align="center">
      <Text size="sm" tone="secondary">
        {first}–{last} of {of.rowCount}
        {of.rowCount < of.rows.length && ` (${of.rows.length} in all)`}
      </Text>
      <Button size="sm" aria-label="Previous page" disabled={of.page <= 1} onClick={() => of.setPage(of.page - 1)}>
        ‹
      </Button>
      <Button size="sm" aria-label="Next page" disabled={of.page >= of.pageCount} onClick={() => of.setPage(of.page + 1)}>
        ›
      </Button>
    </Stack>
  );
}

export default function SearchAndPageFromAHeader() {
  const t = useTable(SERVICES, { rowKey: (s) => s.id, pageSize: 5 });
  const { Table, Column } = t;
  const all = t.pageSize >= t.rows.length;

  return (
    <Card>
      <CardHeader
        divider
        title="Services"
        actions={
          <Stack direction="row" gap={2} align="center" wrap>
            <Input
              type="search"
              size="sm"
              chars={18}
              placeholder="Service or team"
              aria-label="Search the services"
              value={t.search}
              onChange={(event) => t.setSearch(event.target.value)}
            />
            <RangePager of={t} />
            <Button size="sm" onClick={() => t.setPageSize(all ? 5 : t.rows.length)}>
              {all ? "Five per page" : "Show all"}
            </Button>
          </Stack>
        }
      />
      <CardBody>
        <Table ariaLabel="Services">
          <Column value="name" label="Service" rowHeader />
          <Column value="team" label="Team" />
          <Column value="tier" label="Tier" />
          <Pagination pageSizes={[5, 10]} />
        </Table>
      </CardBody>
    </Card>
  );
}
