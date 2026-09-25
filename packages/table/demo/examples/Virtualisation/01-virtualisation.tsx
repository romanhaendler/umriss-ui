import { useMemo } from "react";
import { Badge, Stack, Text, useFormats } from "@umriss-ui/core";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Scroll twenty thousand rows";
export const lead = "`virtual` renders only the rows in view; sorting, search, “select all” and the arrow keys still reach every row. It replaces paging.";

/* The minimum width comes from the application's stylesheet - `width` is an
   initial width - so that header and row header have something to stick
   against sideways as well. */
const STYLE = `
.request-log table {
  min-width: 1300px;
}
`;

interface Request {
  id: string;
  service: string;
  route: string;
  status: 200 | 404 | 500;
  duration: number;
  size: number;
  region: string;
  client: string;
}

const SERVICES = ["Checkout", "Billing", "Sign-in", "Search", "Image service", "Notifications", "Webhooks", "Reporting"] as const;
const ROUTES = ["/api/cart", "/api/pay", "/api/session", "/api/search", "/img/thumb", "/api/notify", "/hooks/deliver", "/api/report"] as const;
const REGIONS = ["eu-west", "eu-central", "us-east", "ap-south"] as const;
const CLIENTS = ["Web shop", "iOS app", "Android app", "Partner API"] as const;
const STATUSES = [200, 200, 200, 200, 200, 200, 404, 500] as const;
const TONE = { 200: "success", 404: "warning", 500: "danger" } as const;

const pick = <T,>(field: readonly T[], share: number): T => field[Math.floor(share * field.length) % field.length]!;

/* A linear congruential generator: the same seed yields the same rows. */
function generate(count: number): Request[] {
  let seed = 20260317;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  return Array.from({ length: count }, (_, i) => {
    const service = Math.floor(next() * SERVICES.length);
    return {
      id: `REQ-${String(i + 1).padStart(5, "0")}`,
      service: SERVICES[service]!,
      route: ROUTES[service]!,
      status: pick(STATUSES, next()),
      duration: Math.round(20 + next() * 900),
      size: Math.round(next() * 5000) / 10,
      region: pick(REGIONS, next()),
      client: pick(CLIENTS, next()),
    };
  });
}

export default function Virtualisation() {
  const requests = useMemo(() => generate(20_000), []);
  const formats = useFormats();
  const t = useTable(requests, {
    rowKey: (r) => r.id,
    defaultSort: { column: "id", direction: "asc" },
    virtual: { rowHeight: 37 },
  });
  const { Table, Column } = t;

  return (
    <Stack gap={2}>
      <style>{STYLE}</style>
      <Table className="request-log" selectable stickyHeader stickyRowHeader maxHeight="340px" ariaLabel="Requests">
        <Toolbar>
          <Search placeholder="Request or service" />
        </Toolbar>
        <Column value="id" label="Request" rowHeader width={130} />
        <Column value="service" label="Service" width={140} />
        <Column value="route" label="Route" width={150} />
        <Column value="status" label="Status" width={100}>
          {(status) => <Badge tone={TONE[status]}>{status}</Badge>}
        </Column>
        <Column value="duration" label="Duration (ms)" width={130} />
        <Column value="size" label="Size (kB)" format={{ decimals: 1 }} width={110} />
        <Column value="region" label="Region" width={120} />
        <Column value="client" label="Client" width={140} />
      </Table>
      <Text size="xs" tone="muted" mono>
        {t.visible.length} of {formats.count(t.filtered.length)} rendered · {t.selection.count} selected
      </Text>
    </Stack>
  );
}
