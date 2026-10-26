/* The XLSX format: `<Export format={xlsx} />`. Types only from the table - this
   file is an entry point of its own and ships without it. */

import type { ExportFormat } from "../types";
import { partsOf } from "./parts";
import { sheetXml } from "./sheet";
import { zip } from "./zip";

export const xlsx: ExportFormat<Uint8Array> = {
  extension: "xlsx",
  mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  write: (sheet, { wording }) => zip(partsOf(wording.exportSheetName, sheetXml(sheet))),
};
