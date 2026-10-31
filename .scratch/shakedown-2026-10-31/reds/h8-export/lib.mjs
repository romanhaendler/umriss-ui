import { chromium } from "playwright";
import { ROWS, TREE } from "./data.mjs";
export { ROWS, TREE };
export const URL = "http://localhost:4310/";
export async function open(cfg = {}, opts = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ timezoneId: opts.tz ?? "Europe/Berlin", viewport: { width: 1500, height: 900 }, acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write"] });
  const page = await ctx.newPage();
  const logs = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(m.type() + ": " + m.text()); });
  page.on("pageerror", (e) => logs.push("pageerror: " + e.message));
  await page.goto(URL + "?cfg=" + encodeURIComponent(JSON.stringify(cfg)));
  await page.waitForFunction(() => window.t);
  return { browser, page, logs, close: () => browser.close() };
}
// raw state accessors
export const csv = (page) => page.evaluate(() => window.t.asCsv());
export const sel = (page) => page.evaluate(() => window.t.selectionAsText());
export async function clickExport(page, label = /^Export/) {
  const n = await page.evaluate(() => window.exp.length);
  await page.getByRole("button", { name: label, exact: typeof label === "string" }).first().click();
  await page.waitForFunction((n) => window.exp.length > n, n);
  return page.evaluate(() => window.exp[window.exp.length - 1]);
}
export async function download(page, label = /^Export/) {
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: label, exact: typeof label === "string" }).first().click()]);
  const fs = await import("node:fs");
  return { name: dl.suggestedFilename(), buf: fs.readFileSync(await dl.path()) };
}
// ---- oracle ----
export const num = (v, dec) => String(v).replace(".", dec);
export function cell(v, c) {
  if (v === null || v === undefined || (typeof v === "number" && Number.isNaN(v))) return "";
  if (typeof v === "boolean") return c.lang === "de" ? (v ? "ja" : "nein") : v ? "yes" : "no";
  if (typeof v === "number") return num(v, c.lang === "de" ? "," : ".");
  if (v instanceof Date) return c.dateAsDay ? dayOf(v) : v.toISOString();
  return String(v);
}
export const dayOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function quote(s, sep) { return s.includes(sep) || /["\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
export function toCsv(header, rows, lang) {
  const sep = lang === "de" ? ";" : ",";
  return [header, ...rows].map((r) => r.map((x) => quote(x, sep)).join(sep)).join("\r\n");
}
export function diff(a, b) {
  if (a === b) return null;
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  return `first diff at ${i}: got ${JSON.stringify(a.slice(Math.max(0, i - 40), i + 60))} expected ${JSON.stringify(b.slice(Math.max(0, i - 40), i + 60))}`;
}
