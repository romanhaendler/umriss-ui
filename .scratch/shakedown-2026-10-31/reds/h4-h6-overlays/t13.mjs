import {open} from "./lib.mjs";
const w=(n=400)=>new Promise(r=>setTimeout(r,n));
const {browser,page,errors}=await open("x"); await page.goto("http://127.0.0.1:4320/multi.html"); await w(1500);
await page.click("#in-S"); await page.keyboard.type("a/b"); await w(300);
console.log("shadow input value:",await page.evaluate(()=>document.getElementById("host").shadowRoot.getElementById("in-S").value),"palette opened:",await page.evaluate(()=>window.__pal));
await page.keyboard.press("Escape"); await w(400);
const f=page.frameLocator("#fr"); await f.locator("#in-F").click(); await page.keyboard.type("a/b"); await w(300);
console.log("iframe input value:",await f.locator("#in-F").inputValue(),"palette:",await page.evaluate(()=>window.__pal));
console.log(errors.length?errors:"") ; await browser.close();
