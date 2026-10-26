/* `<Export format={xlsx} />` mounted: the file name and MIME type follow the
   format and the language, the sheet's name is the wording's. */

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Export, Toolbar, useTable } from "../src";
import { xlsx } from "../src/xlsx";

function Parts() {
  const { Table, Column } = useTable([{ id: "a", name: "Bolt" }], { rowKey: (p) => p.id });
  return (
    <Table aria-label="Parts">
      <Toolbar>
        <Export format={xlsx} label="Excel" />
      </Toolbar>
      <Column value="name" label="Name" rowHeader />
    </Table>
  );
}

afterEach(() => vi.restoreAllMocks());

const download = (ui: React.ReactNode) => {
  const blobs: Blob[] = [];
  URL.createObjectURL = vi.fn((b: Blob | MediaSource) => (blobs.push(b as Blob), "blob:x"));
  URL.revokeObjectURL = vi.fn();
  const names: string[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
    names.push(this.download);
  });
  render(ui);
  fireEvent.click(screen.getByRole("button", { name: "Excel" }));
  return { name: names[0], blob: blobs[0]! };
};

/* jsdom's Blob has no `arrayBuffer`. */
const bytesOf = (blob: Blob) =>
  new Promise<Uint8Array>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(blob);
  });

describe("Export with xlsx", () => {
  it("downloads table.xlsx, a ZIP with the sheet named by the wording", async () => {
    const { name, blob } = download(<Parts />);
    expect(name).toBe("table.xlsx");
    expect(blob.type).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    const bytes = await bytesOf(blob);
    expect([...bytes.slice(0, 2)]).toEqual([0x50, 0x4b]);
    expect(new TextDecoder().decode(bytes)).toContain('<sheet name="Table"');
  });

  it("downloads tabelle.xlsx under German wording", async () => {
    const { name, blob } = download(
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <Parts />
      </LanguageProvider>,
    );
    expect(name).toBe("tabelle.xlsx");
    expect(new TextDecoder().decode(await bytesOf(blob))).toContain('<sheet name="Tabelle"');
  });
});
