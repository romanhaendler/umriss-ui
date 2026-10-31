import { openRec } from "./lib.mjs";
const wait = +process.argv[3]; const seq = JSON.parse(process.argv[2]);
const s = await openRec("core"); const p = s.page;
const act = () => p.evaluate(() => { const a = document.activeElement; return a === document.body ? "BODY" : (a.getAttribute("aria-label")||a.textContent||"").slice(0,30); });
await p.getByRole("button", { name: "Date", exact: true }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
const out = [];
for (const k of seq) { await p.keyboard.press(k); await p.waitForTimeout(wait); out.push(k + "->" + await act()); }
console.log(out.join("\n")); await s.close();
