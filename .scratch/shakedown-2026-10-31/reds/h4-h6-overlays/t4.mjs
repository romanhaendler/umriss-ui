import {open,active} from "./lib.mjs";
const w=(n=350)=>new Promise(r=>setTimeout(r,n));
const {browser,page}=await open("odd");
await page.click("#open-d"); await w();
await page.evaluate(()=>document.getElementById("close-d").click()); await w(600);
console.log("drawer only, closed by state ->",await active(page));
await page.click("#open-d"); await w(); await page.keyboard.press("Escape"); await w(600);
console.log("drawer only, Escape ->",await active(page));
// nested open, then close the nested via esc, then close drawer state
await page.click("#open-d"); await w(); await page.click("#nested-open"); await w();
await page.keyboard.press("Escape"); await w(500); console.log("nested esc ->",await active(page));
await page.evaluate(()=>document.getElementById("close-d").click()); await w(600); console.log("then drawer by state ->",await active(page));
await browser.close();
