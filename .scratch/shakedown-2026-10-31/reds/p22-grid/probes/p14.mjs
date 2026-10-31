import { open } from "./lib.mjs";
const p = await open("s=auto", { width: 1100, height: 900 });
const w = () => p.evaluate(() => JSON.stringify([...document.querySelectorAll("thead th")].map(x => x.textContent.trim().slice(0,8)+":"+Math.round(x.getBoundingClientRect().width))));
const grip = p.locator("thead th").nth(1).locator("[class*=_grip_]");
console.log("grip count", await grip.count());
const bb = await grip.boundingBox(); console.log(bb);
await p.mouse.dblclick(bb.x + bb.width/2, bb.y + bb.height/2); await p.waitForTimeout(300);
console.log("dbl dept", await w(), JSON.stringify(await p.evaluate(()=>window.__t.widths)));
// drag grip with escape mid-drag
const bb2 = await p.locator("thead th").nth(0).locator("[class*=_grip_]").boundingBox();
await p.mouse.move(bb2.x + bb2.width/2, bb2.y + bb2.height/2); await p.mouse.down(); await p.mouse.move(bb2.x + 200, bb2.y + 5, { steps: 6 });
console.log("mid-drag", await w()); await p.keyboard.press("Escape"); await p.mouse.up(); await p.waitForTimeout(200);
console.log("after esc+up", await w());
// keyboard: Alt+Arrow on grip
await p.locator("thead th").nth(0).focus(); await p.keyboard.press("Alt+ArrowRight"); await p.keyboard.press("Alt+ArrowRight");
console.log("alt arrows", await w());
console.log(await p.evaluate(()=>[...document.querySelectorAll("thead [class*=_grip_]")].map(e=>e.getAttribute("aria-label")+"|"+e.getAttribute("aria-orientation")+"|"+e.getAttribute("aria-valuenow")+"|"+e.getAttribute("tabindex"))));
console.log(p.errs); await p.b.close();
