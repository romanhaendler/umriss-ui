/* The table toolbar and the list filter speak from the wording and write their
   numbers with the provider's formats.

   The counterparts of the tests that ran in @umriss-ui/core against
   `TableFilterStrip` and `TableFilter` (`sprache.test.tsx`) until the table left
   there (umriss-table 14) – since table-filters 04 at the table toolbar, where
   the conditions now stand.

   The ratio shows both registers at once: the words come from the wording,
   which is English by default, and the notation from the formats, which are
   still `de-DE` (ADR-0019). */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Pagination, Search, Toolbar, useTable } from "../src";
import type { Table } from "../src";

interface Row {
  id: string;
  number: string;
  status: "Aktiv" | "Pausiert" | "Gesperrt";
}

/* 43 matches in 1,204 rows: only from four digits on does it show which
   notation the number stands in. */
const ROWS: Row[] = Array.from({ length: 1204 }, (_, i) => ({
  id: `z${i}`,
  number: i < 43 ? `Y-${i}` : `X-${i}`,
  status: i % 3 === 0 ? "Aktiv" : i % 3 === 1 ? "Pausiert" : "Gesperrt",
}));

let current: Table<Row> | null = null;
const capture = (t: Table<Row>) => {
  current = t;
};

function TableWithSearch() {
  const t = useTable(ROWS, { rowKey: (z) => z.id, initialView: { search: "Y" } });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame>
      <Toolbar>
        <Search />
      </Toolbar>
      <Column value="number" label="Nummer" rowHeader />
      <Column value="status" label="Status" filter="list" />
      <Pagination />
    </Frame>
  );
}

describe("Table toolbar and list filter from the wording", () => {
  it("writes the ratio in German notation without a provider", () => {
    render(<TableWithSearch />);
    expect(screen.getByRole("status").textContent).toBe("43 of 1.204");
  });

  it("carries an overridden formatter into the table toolbar", () => {
    render(
      <LanguageProvider formats={{ count: (n) => `#${n}` }}>
        <TableWithSearch />
      </LanguageProvider>,
    );
    expect(screen.getByRole("status").textContent).toBe("#43 of #1204");
  });

  it("carries an overridden sentence structure into the table toolbar", () => {
    render(
      <LanguageProvider wording={{ filteredOfTotal: (t, g) => `${t}/${g}` }}>
        <TableWithSearch />
      </LanguageProvider>,
    );
    expect(screen.getByRole("status").textContent).toBe("43/1.204");
  });

  it("labels the buttons of the list filter from the wording", () => {
    render(
      <LanguageProvider wording={{ filterReset: "Zurücksetzen", filterDone: "Fertig" }}>
        <TableWithSearch />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Filter Status" }));
    expect(screen.getByRole("button", { name: "Zurücksetzen" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Fertig" })).toBeTruthy();
  });

  it("names a condition, its buttons, the rest of a long list and the reset from the wording", () => {
    render(
      <LanguageProvider
        wording={{
          conditions: "Aktive Filter",
          editConditionNamed: (label, value) => `${label}: ${value} bearbeiten`,
          removeConditionNamed: (label, value) => `${label}: ${value} entfernen`,
          moreValues: (_count, formatted) => `und ${formatted} weitere`,
          resetAll: "Alles zurücksetzen",
        }}
      >
        <TableWithSearch />
      </LanguageProvider>,
    );
    act(() => current!.setFilter("status", ["Aktiv", "Pausiert", "Gesperrt"]));
    expect(screen.getByRole("list", { name: "Aktive Filter" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Status: Aktiv, Pausiert und 1 weitere bearbeiten" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Status: Aktiv, Pausiert und 1 weitere entfernen" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Alles zurücksetzen" })).toBeTruthy();
  });

  /* ADR-0019: German is shipped behind the subpath. One mount holds that wire
     from a consumer's side, written the way an application writes it. */
  it("renders the ratio in German when the German wording is handed in", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <TableWithSearch />
      </LanguageProvider>,
    );
    expect(screen.getByRole("status").textContent).toBe("43 von 1.204");
  });
});
