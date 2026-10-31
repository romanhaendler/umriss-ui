import { openRec, axOf } from "./lib.mjs";
const seq = JSON.parse(process.argv[2]); const lang = process.argv[3] || "en";
const s = await openRec("gridrow", { lang }); const p = s.page; const ax = axOf(p);
const st = () => p.evaluate(() => { const a = document.activeElement; const tr = a.closest("tr"); return `${a === document.body ? "BODY" : a.tagName}@row${tr?.getAttribute("aria-rowindex")} ${(tr?.getAttribute("data-draft")||"")}`; });
await p.evaluate(() => document.querySelector("[role=grid] tbody td").focus());
console.log("start", await st(), "|", await ax());
for (const k of seq) { if (k.startsWith("T:")) await p.keyboard.type(k.slice(2)); else if (k.startsWith("C:")) await p.getByRole("button", { name: k.slice(2) }).first().click(); else await p.keyboard.press(k); await p.waitForTimeout(250); console.log(k.padEnd(12), (await st()).padEnd(22), "|", (await ax()).slice(0, 110), JSON.stringify(await s.live()), "log:", await p.locator("#log").textContent()); }
console.log(s.errors.join("\n")); await s.close();
