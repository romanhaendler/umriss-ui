import {open,active,openDialogs} from "./lib.mjs";
const w=(n=500)=>new Promise(r=>setTimeout(r,n));
for (const strict of ["0","1"]) {
const {browser,page,errors}=await open("cond","&strict="+strict);
await page.click("#t"); await w(); console.log("strict",strict,"open: dlg",JSON.stringify(await openDialogs(page)),"focus",await active(page));
await page.keyboard.press("Escape"); await w(800);
console.log("  after Escape with {open && <Modal open>}: dialogs left",await page.evaluate(()=>document.querySelectorAll("dialog").length),"focus",await active(page),"(trigger #t expected)");
console.log(errors); await browser.close();}
