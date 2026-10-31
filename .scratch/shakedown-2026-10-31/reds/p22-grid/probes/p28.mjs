import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
await p.evaluate(() => window.__t.setPageSize(50)); await p.waitForTimeout(400);
console.log(await p.evaluate(()=>{const f=document.querySelector("tfoot td, tfoot th"); const cs=getComputedStyle(f); return [cs.position, cs.bottom, Math.round(f.getBoundingClientRect().top)];}));
// 150 columns column virtualisation spot check skip; check keyboard grid with column groups: arrow navigation from group header row?
await p.evaluate(() => window.__t.focusCell("r2","name")); await p.keyboard.press("Control+Home"); 
console.log("ctrl+home", await p.evaluate(()=>document.activeElement.tagName+":"+document.activeElement.textContent.slice(0,15)+":"+document.activeElement.closest("tr")?.getAttribute("aria-rowindex")));
await p.keyboard.press("ArrowUp"); console.log("up", await p.evaluate(()=>document.activeElement.tagName+":"+document.activeElement.textContent.slice(0,15)+":"+document.activeElement.closest("tr")?.getAttribute("aria-rowindex")));
await p.keyboard.press("ArrowUp"); console.log("up2 (group row?)", await p.evaluate(()=>document.activeElement.tagName+":"+document.activeElement.textContent.slice(0,15)+":"+document.activeElement.closest("tr")?.getAttribute("aria-rowindex")));
await p.keyboard.press("ArrowRight");await p.keyboard.press("ArrowRight"); console.log("right", await p.evaluate(()=>document.activeElement.tagName+":"+document.activeElement.textContent.slice(0,15)));
await p.keyboard.press("Enter"); console.log("enter on head", await p.evaluate(()=>JSON.stringify(window.__t.sort)));
console.log(p.errs); await p.b.close();
