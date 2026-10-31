import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
const widths = () => p.evaluate(() => JSON.stringify([...document.querySelectorAll("thead tr:last-child th")].map(x => x.textContent.trim().slice(0,5)+":"+Math.round(x.getBoundingClientRect().width))));
console.log("start", await widths());
await p.getByRole("button", { name: "Columns" }).click();
console.log("menu", await p.locator("[role=dialog], [popover]").last().innerText());
await p.screenshot({ path: "shots/colmenu.png" });
await p.getByText("Fit all columns").click(); await p.waitForTimeout(300);
console.log("fit all", await widths(), JSON.stringify(await p.evaluate(()=>window.__t.widths)));
await p.keyboard.press("Escape");
const tw = await p.evaluate(()=>[document.querySelector("table").getBoundingClientRect().width, document.querySelector("table").parentElement.scrollWidth, document.querySelector("table").parentElement.clientWidth]);
console.log("table/scroll", tw);
await p.screenshot({ path: "shots/fitall.png" });
// resize with grip: drag Name grip
const grips = await p.$$("[class*=grip], [role=separator]"); console.log("grips", grips.length);
if (grips.length) { const bb = await grips[0].boundingBox(); await p.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2); await p.mouse.down(); await p.mouse.move(bb.x+120, bb.y+5, {steps:5}); 
  await p.keyboard.press("Escape"); await p.mouse.up(); await p.waitForTimeout(200); console.log("after esc drag", await widths()); }
if (grips.length) { const bb = await grips[0].boundingBox(); await p.mouse.dblclick(bb.x+bb.width/2, bb.y+bb.height/2); await p.waitForTimeout(200); console.log("dbl", await widths()); }
console.log(p.errs);
await p.b.close();
