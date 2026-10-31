import {open,active} from "./lib.mjs";
const w=(n=400)=>new Promise(r=>setTimeout(r,n));
const {browser,page}=await open("nest");
await page.click("#open-modal"); await w();
await page.mouse.move(900,600); await page.mouse.wheel(0,400); await w(300);
console.log("scrollY after wheel on backdrop with modal open:",await page.evaluate(()=>scrollY),"| body overflow:",await page.evaluate(()=>getComputedStyle(document.body).overflow),"| scrollbar-gutter:",await page.evaluate(()=>getComputedStyle(document.documentElement).scrollbarGutter));
// toast opened, then Esc order: toast focused + modal
await browser.close();
