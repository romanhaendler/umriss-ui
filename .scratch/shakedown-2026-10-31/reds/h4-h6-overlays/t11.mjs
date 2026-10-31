import {open,active,openDialogs} from "./lib.mjs";
const w=(n=350)=>new Promise(r=>setTimeout(r,n));
for (const mode of ["sw","sw-t"]) {
const {browser,page,errors}=await open("susp","&strict=0"); await w(1800);
console.log(mode,"initial: dlg",JSON.stringify(await openDialogs(page)),"focus",await active(page));
if(mode==="sw") await page.evaluate(()=>document.getElementById("sw").click()); else await page.evaluate(()=>document.getElementById("sw-t").click());
await w(300);
console.log(" suspended: fallback shown?",await page.evaluate(()=>!!document.getElementById("fallback")),"dlg open attr",JSON.stringify(await openDialogs(page)),"dlg display",await page.evaluate(()=>(document.querySelector("dialog")?getComputedStyle(document.querySelector("dialog")).display:"no dialog")),"modal sel",await page.evaluate(()=>document.querySelectorAll("dialog:modal").length),"focus",await active(page));
console.log(" click fallback btn:",await page.click("#fb-btn",{timeout:1500}).then(()=>"ok").catch(()=>"BLOCKED"));
await w(1500);
console.log(" resolved: dlg",JSON.stringify(await openDialogs(page)),"focus",await active(page));
console.log(errors); await browser.close();}
