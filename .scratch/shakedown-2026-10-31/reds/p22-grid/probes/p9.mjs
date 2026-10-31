import { open } from "./lib.mjs";
import { writeFileSync } from "node:fs";
const p = await open("s=main", { width: 1100, height: 900 });
// hide a grouped column, pin, then export
await p.evaluate(() => { window.__t.toggleColumn("qty"); window.__t.setPin("note", "start"); });
await p.waitForTimeout(200);
console.log("ths", await p.$$eval("thead th", e => e.map(x => x.textContent + ":" + (x.colSpan))));
await p.getByRole("button", { name: "XLSX" }).click(); await p.waitForTimeout(300);
const x = await p.evaluate(async () => { const c = window.__xlsx; return c instanceof Blob ? Array.from(new Uint8Array(await c.arrayBuffer())) : (c instanceof Uint8Array ? Array.from(c) : typeof c); });
console.log("xlsx", typeof x === "string" ? x : x.length);
if (typeof x !== "string") writeFileSync("out.xlsx", Buffer.from(x));
console.log("csv", JSON.stringify(await p.evaluate(() => window.__t.asCsv().split("\n").slice(0, 4))));
console.log("copy-text", JSON.stringify(await p.evaluate(() => window.__t.selectionAsText())));
await p.b.close();
