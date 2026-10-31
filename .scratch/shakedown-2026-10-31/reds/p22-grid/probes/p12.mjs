import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
const sc = () => p.evaluate(()=>{const s=document.querySelector("table").parentElement;return [s.scrollWidth,s.clientWidth, s.tagName, Math.round(document.querySelector("table").getBoundingClientRect().width)]});
console.log("before", await sc());
console.log(await p.evaluate(() => [...document.querySelectorAll("thead tr:last-child th")].slice(1,3).map(x=>x.innerHTML.slice(0,600))));
await p.evaluate(()=>window.__t.autoSizeColumns()); await p.waitForTimeout(300);
console.log("after autoSize", JSON.stringify(await p.evaluate(()=>window.__t.widths)), await sc());
// shrink max-content test: fixed-width scenes
await p.b.close();
