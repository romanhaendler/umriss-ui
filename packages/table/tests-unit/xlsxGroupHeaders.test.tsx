/* The workbook of a grouped table: read from the produced file's bytes, the
   header cells of grouped columns say "<group> · <column>". */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColumnGroup, Export, Toolbar, useTable } from "../src";
import { xlsx } from "../src/xlsx";

function Report() {
  const { Table, Column } = useTable([{ id: "a", name: "Bolt", jan: 1, feb: 2 }], { rowKey: (r) => r.id });
  return (
    <Table aria-label="Report">
      <Toolbar>
        <Export format={xlsx} label="Excel" />
      </Toolbar>
      <Column value="name" label="Name" rowHeader />
      <ColumnGroup label="Q1">
        <Column value="jan" label="Jan" />
        <Column value="feb" label="Feb" />
      </ColumnGroup>
    </Table>
  );
}

describe("Export with xlsx and column groups", () => {
  it("writes the group into each header cell of the first sheet row", async () => {
    let blob!: Blob;
    URL.createObjectURL = vi.fn((b: Blob | MediaSource) => ((blob = b as Blob), "blob:x"));
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<Report />);
    fireEvent.click(screen.getByRole("button", { name: "Excel" }));
    const bytes = await new Promise<Uint8Array>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.readAsArrayBuffer(blob);
    });
    /* The writer stores its entries uncompressed, so the sheet XML is in the bytes. */
    const xml = new TextDecoder().decode(bytes);
    const firstRow = /<row r="1"[^>]*>([\s\S]*?)<\/row>/.exec(xml)![1]!;
    const headers = [...firstRow.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((m) => m[1]);
    expect(headers).toEqual(["Name", "Q1 · Jan", "Q1 · Feb"]);
  });
});
