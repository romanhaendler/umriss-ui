import { openRec } from "./lib.mjs";
const s = await openRec("fit", { q: "&h=360px", h: 700 }); const p = s.page;
const info = (l) => p.evaluate((l) => { const g = document.querySelector("[role=grid]"); const rows = g.querySelectorAll("tbody tr"); return `${l}: rows=${rows.length} first=${rows[0]?.getAttribute("aria-rowindex")} rowcount=${g.getAttribute("aria-rowcount")} nav="${document.querySelector("nav")?.innerText.replace(/\n/g, " | ")}" live=${[...document.querySelectorAll("[role=status]")].map(e=>e.textContent)}`; }, l);
console.log(await info("load"));
await p.locator("tbody th").first().focus(); await p.keyboard.press("PageDown"); await p.waitForTimeout(300); console.log(await info("PageDown"), await p.evaluate(()=>document.activeElement.tagName+":"+document.activeElement.closest("tr")?.getAttribute("aria-rowindex")));
await p.setViewportSize({ width: 1200, height: 520 }); await p.evaluate(()=>{document.querySelector("main > div").style.height="220px";}); await p.waitForTimeout(600); console.log(await info("shrunk"), await s.live());
await p.evaluate(()=>{document.querySelector("main > div").style.height="620px";}); await p.waitForTimeout(600); console.log(await info("grown"), JSON.stringify(await s.live()), await p.evaluate(()=>document.activeElement.tagName+":"+document.activeElement.closest("tr")?.getAttribute("aria-rowindex")));
console.log(s.errors.join("\n")); await s.close();
