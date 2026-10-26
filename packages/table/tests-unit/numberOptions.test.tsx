/* A column's `format` as Intl's options: the year that reads 2024 in German
   in the cell, the list filter, the range filter's fields and a group line,
   a currency, a percent with a decimal, and a verdict column. */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS } from "@umriss-ui/core/wording/de";
import { useTable } from "../src";

interface Row {
  id: string;
  year: number;
  price: number;
  share: number;
}

const ROWS: Row[] = [
  { id: "a", year: 2024, price: 1234.5, share: 0.256 },
  { id: "b", year: 2025, price: 99, share: 0.0004 },
];

function Report({ grouped = false }: { grouped?: boolean }) {
  const { Table, Column, VerdictColumn } = useTable(ROWS, {
    rowKey: (r) => r.id,
    ...(grouped ? { defaultGrouping: ["year" as const] } : {}),
  });
  return (
    <LanguageProvider formats={GERMAN_FORMATS}>
      <Table aria-label="Report">
        <Column value="id" label="Id" rowHeader />
        <Column value="year" label="Year" format={{ useGrouping: false }} filter="list" />
        <Column id="yearRange" value="year" label="Span" format={{ useGrouping: false }} filter="range" />
        <Column value="price" label="Price" format={{ style: "currency", currency: "EUR" }} />
        <Column value="share" label="Share" format={{ style: "percent", decimals: 1 }} />
        <VerdictColumn id="verdict" value="price" label="Verdict" limits={{ limits: [{ value: 5000, side: "upper", severity: "alarm" }] }} format={{ style: "currency", currency: "EUR" }} />
      </Table>
    </LanguageProvider>
  );
}

const nbsp = (s: string | null | undefined) => (s ?? "").replace(/[  ]/g, " ");

describe("an options format under German formats", () => {
  it("writes the year as 2024 in a cell, a currency and a percent with a decimal", () => {
    const { container } = render(<Report />);
    const row = container.querySelector("tbody tr")!;
    const text = Array.from((row as HTMLTableRowElement).cells).map((c) => nbsp(c.textContent));
    expect(text).toContain("2024");
    expect(text).not.toContain("2.024");
    expect(text).toContain("1.234,50 €");
    expect(text).toContain("25,6 %");
  });

  it("writes a share that rounds to zero without a sign", () => {
    const { container } = render(<Report />);
    expect(nbsp(container.querySelectorAll("tbody tr")[1]!.textContent)).toContain("0,0 %");
  });

  it("writes the verdict column's value with the format", () => {
    const { container } = render(<Report />);
    expect(nbsp(container.querySelector("tbody [data-verdict]")!.textContent)).toContain("1.234,50 €");
  });

  it("lists the year as 2024 in the list filter", () => {
    render(<Report />);
    fireEvent.click(screen.getByRole("button", { name: "Filter Year" }));
    const dialog = screen.getByRole("dialog", { name: "Filter Year" });
    expect(within(dialog).getByText("2024")).toBeTruthy();
    expect(within(dialog).queryByText("2.024")).toBeNull();
  });

  it("keeps the year as 2024 in both range fields after leaving them", () => {
    render(<Report />);
    fireEvent.click(screen.getByRole("button", { name: "Filter Span" }));
    const dialog = screen.getByRole("dialog", { name: "Filter Span" });
    const from = within(dialog).getByLabelText("From") as HTMLInputElement;
    const to = within(dialog).getByLabelText("To") as HTMLInputElement;
    fireEvent.change(from, { target: { value: "2024" } });
    fireEvent.blur(from);
    fireEvent.change(to, { target: { value: "2025" } });
    fireEvent.blur(to);
    expect(from.value).toBe("2024");
    expect(to.value).toBe("2025");
  });

  it("writes the year as 2024 in a group line", () => {
    const { container } = render(<Report grouped />);
    const band = container.querySelector<HTMLTableRowElement>("tbody tr[data-line]")!;
    expect(band.textContent).toContain("2024");
    expect(band.textContent).not.toContain("2.024");
  });
});
