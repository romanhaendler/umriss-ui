import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
await p.evaluate(() => { window.__live = []; new MutationObserver(() => { window.__live.push([...document.querySelectorAll("[role=status],[aria-live]")].map(e => e.textContent)); }).observe(document.body, { subtree: true, childList: true, characterData: true }); });
await p.getByRole("button", { name: "Next page" }).click(); await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(()=>window.__live.slice(-4))), await p.$$eval("[role=status],[aria-live]", e=>e.map(x=>x.getAttribute("aria-live")+":"+x.textContent+":"+x.outerHTML.slice(0,100))));
console.log("row 1 aria", await p.evaluate(()=>{const r=document.querySelector("tbody tr");return [r.getAttribute("aria-rowindex"), r.textContent.slice(0,10)]}));
await p.b.close();
