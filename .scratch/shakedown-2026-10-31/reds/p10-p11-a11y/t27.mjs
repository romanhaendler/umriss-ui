import { openRec, axOf } from "./lib.mjs";
const s = await openRec("gridrow", { lang: "en" }); const p = s.page; const ax = axOf(p);
await p.locator('button[aria-label^="Delete: Person 0001"]').focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
console.log(await p.evaluate(() => { const tr = document.activeElement.closest("tr"); return tr.outerHTML.replace(/class="[^"]*"/g, "").replace(/<svg.*?<\/svg>/g,"").slice(0, 1800); }));
for (const k of ["Shift+Tab", "Shift+Tab", "Shift+Tab"]) { await p.keyboard.press(k); console.log(k, await ax()); }
await s.close();
