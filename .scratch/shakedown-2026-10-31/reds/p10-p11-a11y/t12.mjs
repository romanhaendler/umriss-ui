import { openRec, axOf } from "./lib.mjs";
const s = await openRec("core", { lang: process.argv[2]||"en" }); const p = s.page; const ax = axOf(p);
const act = () => p.evaluate(() => { const a = document.activeElement; return a === document.body ? "BODY" : a.tagName + " " + (a.getAttribute("aria-label")||"").slice(0,40) + " " + (a.closest("[role=dialog]") ? "in-dialog":"outside"); });
await p.getByRole("button", { name: "Date", exact: true }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
console.log("opened", await act());
for (const k of JSON.parse(process.argv[3])) { await p.keyboard.press(k); await p.waitForTimeout(150); console.log(k.padEnd(18), await act(), "|", await ax(), "| dlg:", await p.locator("[role=dialog]:visible").count(), JSON.stringify(await s.live())); }
console.log(s.errors.join("\n")); await s.close();
