import { openRec, axOf } from "./lib.mjs";
const lang = process.argv[2] || "de";
const s = await openRec("gridrow", { lang }); const p = s.page; const ax = axOf(p);
const row = () => p.evaluate(() => [...document.querySelectorAll("[role=grid] tbody tr")].slice(0,3).map(r => r.getAttribute("aria-rowindex") + ":" + (r.querySelector("th")?.textContent||r.textContent).slice(0,24) + (r.getAttribute("data-draft")!==null?"[draft]":"")).join(" / "));
const say = async (l) => console.log(l.padEnd(18), (await ax()).slice(0, 100), "|", JSON.stringify(await s.live()), "|", await p.locator("#log").textContent(), "|", await row());
const btns = await p.locator("[role=grid] button, button").evaluateAll(bs => bs.map(b => b.getAttribute("aria-label") || b.textContent).filter(Boolean).slice(0, 8));
console.log(btns);
await p.locator("button", { hasText: /Neue Zeile|New row|Neu/ }).first().focus(); await say("focus new");
await p.keyboard.press("Enter"); await p.waitForTimeout(300); await say("Enter new");
await p.keyboard.press("Escape"); await p.waitForTimeout(300); await say("Escape");
// delete
await p.locator('button[aria-label^="Löschen: Person 0001"], button[aria-label^="Delete: Person 0001"]').focus(); await say("focus delete");
await p.keyboard.press("Enter"); await p.waitForTimeout(300); await say("Enter delete");
await p.keyboard.press("Tab"); await say("Tab"); await p.keyboard.press("Tab"); await say("Tab");
await p.keyboard.press("Escape"); await p.waitForTimeout(200); await say("Escape");
await p.keyboard.press("Enter"); await p.waitForTimeout(200); await say("Enter");
await p.keyboard.press("Enter"); await p.waitForTimeout(300); await say("Enter confirm?");
console.log(s.errors.join("\n")); await s.close();
