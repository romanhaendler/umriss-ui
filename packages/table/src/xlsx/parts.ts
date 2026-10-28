/* The fixed parts of the workbook: what a reader needs to find the one sheet
   and the three cell formats. */

const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const NS = "http://schemas.openxmlformats.org/";
const MAIN = `${NS}spreadsheetml/2006/main`;
const REL = `${NS}package/2006/relationships`;
const DOC_REL = `${NS}officeDocument/2006/relationships`;

/* Characters XML 1.0 allows; a lone surrogate is none. */
export const FORBIDDEN = /[^\t\n\r -퟿-�\u{10000}-\u{10FFFF}]/gu;

export const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A sheet name as Excel takes it: without `[]:*?/\`, control characters, lone
    surrogates and whatever else XML 1.0 forbids, at most 31 characters, `Sheet1` where nothing is left. */
export function sheetName(name: string): string {
  // Cut first, then drop lone surrogates: the cut can split a pair.
  return name.replace(/[[\]:*?/\\\u0000-\u001f]/g, "").slice(0, 31).replace(FORBIDDEN, "") || "Sheet1";
}

/** The six parts in the order the file holds them. `sheet` is `sheet1.xml`. */
export function partsOf(name: string, sheet: string): { name: string; text: string }[] {
  return [
    {
      name: "[Content_Types].xml",
      text:
        `${XML}<Types xmlns="${NS}package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      text: `${XML}<Relationships xmlns="${REL}"><Relationship Id="rId1" Type="${DOC_REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      text: `${XML}<workbook xmlns="${MAIN}" xmlns:r="${DOC_REL}"><sheets><sheet name="${escapeXml(sheetName(name))}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      text:
        `${XML}<Relationships xmlns="${REL}">` +
        `<Relationship Id="rId1" Type="${DOC_REL}/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="${DOC_REL}/styles" Target="styles.xml"/></Relationships>`,
    },
    {
      /* Cell format 0 is general, 1 a date, 2 a date with time. */
      name: "xl/styles.xml",
      text:
        `${XML}<styleSheet xmlns="${MAIN}">` +
        `<numFmts count="2"><numFmt numFmtId="164" formatCode="yyyy-mm-dd"/><numFmt numFmtId="165" formatCode="yyyy-mm-dd hh:mm:ss"/></numFmts>` +
        `<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>` +
        `<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>` +
        `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
        `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
        `<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
        `<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
        `<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>` +
        `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    },
    { name: "xl/worksheets/sheet1.xml", text: sheet },
  ];
}
