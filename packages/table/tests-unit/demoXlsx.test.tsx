/* The demo's Excel example downloads a workbook: a ZIP, which begins `PK`. */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import AnExcelFile from "../demo/examples/Export/05-an-excel-file";

afterEach(() => vi.restoreAllMocks());

it("downloads a file that begins PK", async () => {
  const blobs: Blob[] = [];
  URL.createObjectURL = vi.fn((b: Blob | MediaSource) => (blobs.push(b as Blob), "blob:x"));
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(<AnExcelFile />));
  const button = [...host.querySelectorAll("button")].find((b) => b.textContent === "Export Excel")!;
  await act(async () => button.click());
  const bytes = await new Promise<Uint8Array>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(blobs[0]!);
  });
  expect(String.fromCharCode(bytes[0]!, bytes[1]!)).toBe("PK");
  await act(async () => root.unmount());
  host.remove();
});
