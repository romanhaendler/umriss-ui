import { useState } from "react";
import { Text } from "@umriss-ui/core";
import { Pagination, Search, Toolbar, useTable } from "../../../src";
import type { TableRequest } from "../../../src";

interface Stop {
  id: string;
  street: string;
  parcels: number;
}

const STOPS: readonly Stop[] = Array.from({ length: 400 }, (_, i) => ({
  id: `ST-${String(i + 1).padStart(4, "0")}`,
  street: `Dock ${1 + (i % 24)}`,
  parcels: 1 + ((i * 7) % 9),
}));

export const title = "Fill a pane from a server";
export const lead = "In a parent of definite height a server's page is the fitted page: the first request waits for the measurement and carries the page size that fits, and a resize asks once it has held still. The offer to select all that match is left room in the fit, so ticking the page changes neither the page size nor the page, and no new request goes out.";

const pageOf = (request: TableRequest) => STOPS.slice((request.page - 1) * request.pageSize, request.page * request.pageSize);

export default function FillAPaneFromAServer() {
  const [answer, setAnswer] = useState<{ rows: readonly Stop[]; answers?: TableRequest }>({ rows: [] });
  const [asked, setAsked] = useState(0);
  const { Table, Column } = useTable(answer.rows, {
    rowKey: (s) => s.id,
    pageSize: 5,
    server: true,
    rowCount: STOPS.length,
    answers: answer.answers,
    onRequest: (request) => {
      setAsked((n) => n + 1);
      setTimeout(() => setAnswer({ rows: pageOf(request), answers: request }), 200);
    },
  });

  return (
    <div style={{ display: "grid", gap: "var(--u-space-3)" }}>
      <div data-pane style={{ height: "22.5rem" }}>
        <Table aria-label="Stops on the server" selectable>
          <Toolbar>
            <Search placeholder="Stop or dock" />
          </Toolbar>
          <Column value="id" label="Stop" rowHeader sortable={false} />
          <Column value="street" label="Dock" sortable={false} />
          <Column value="parcels" label="Parcels" sortable={false} />
          <Pagination />
        </Table>
      </div>
      <Text size="xs" tone="muted" data-requests={asked}>{`The server was asked ${asked} ${asked === 1 ? "time" : "times"}.`}</Text>
    </div>
  );
}
