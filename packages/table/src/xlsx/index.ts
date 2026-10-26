/* The XLSX format: `<Export format={xlsx} />`. Types only from the table - this
   file is an entry point of its own and ships without it. */

import type { ExportFormat } from "../types";
import { partsOf } from "./parts";
import { sheetXml } from "./sheet";
import { zip } from "./zip";

/** The Excel workbook format for `Export`: one sheet, a header line, numbers, dates, booleans and text as what they are, and the table's column widths. `onExport` gets the bytes. */
export const xlsx: ExportFormat<Uint8Array> = {
  extension: "xlsx",
  mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  write: (sheet, { wording, wallClock }) => zip(partsOf(wording.exportSheetName, sheetXml(sheet, wallClock))),
};
