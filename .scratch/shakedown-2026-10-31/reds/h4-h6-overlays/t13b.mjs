import {open} from "./lib.mjs";
const w=(n=400)=>new Promise(r=>setTimeout(r,n));
const {browser,page}=await open("x"); await page.goto("http://127.0.0.1:4320/multi.html"); await w(1500);
const f=page.frameLocator("#fr"); await f.locator("#in-F").click(); await page.keyboard.type("a/b"); await page.keyboard.press("Control+k"); await w(300);
console.log("iframe: palette hook fired for F:",JSON.stringify(await page.evaluate(()=>window.__pal)),"value",await f.locator("#in-F").inputValue());
await browser.close();
