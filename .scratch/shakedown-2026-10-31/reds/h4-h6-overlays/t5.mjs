import {open,active,openDialogs} from "./lib.mjs";
const w=(n=350)=>new Promise(r=>setTimeout(r,n));
for (const strict of ["0","1"]) {
const {browser,page}=await open("odd","&strict="+strict);
await page.click("#open-d"); await w(); await page.click("#nested-open"); await w();
console.log("strict",strict,"before:",JSON.stringify(await openDialogs(page)));
await page.keyboard.press("Escape"); await w(600);
console.log("  after Escape on nested:",JSON.stringify(await openDialogs(page)),"focus",await active(page));
await page.click("#open-d"); await w(); await page.click("#nested-open"); await w();
await page.click("dialog[open] >> text=Nested"  ).catch(()=>{});
await browser.close();}
