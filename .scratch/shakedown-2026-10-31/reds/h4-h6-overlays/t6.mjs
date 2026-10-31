import {open,active,openDialogs} from "./lib.mjs";
const w=(n=350)=>new Promise(r=>setTimeout(r,n));
const {browser,page}=await open("nest2");
const st=async(l)=>console.log(l.padEnd(28),"dlg",JSON.stringify(await openDialogs(page)),"focus",await active(page),"log",await page.textContent("#l"));
await page.click("#o"); await w(); await page.click("#oc"); await w(); await st("confirm open");
await page.keyboard.press("Escape"); await w(600); await st("Escape in confirm");
await page.click("#o").catch(()=>{}); await w(); 
if(!(await openDialogs(page)).length){await page.click("#o");await w();}
await page.click("#oc"); await w(); await page.click("text=Cancel"); await w(600); await st("Cancel button");
if(!(await openDialogs(page)).length){await page.click("#o");await w();}
await page.click("#oc"); await w(); await page.evaluate(()=>{const d=[...document.querySelectorAll("dialog[open]")].at(-1);d.querySelector("button:last-of-type").click()}); await w(600); await st("Confirm button");
if(!(await openDialogs(page)).length){await page.click("#o");await w();}
await page.click("#op"); await w(); await st("palette open"); await page.keyboard.press("Escape"); await w(600); await st("Escape in palette");
if(!(await openDialogs(page)).length){await page.click("#o");await w();}
await page.click("#op"); await w(); await page.keyboard.press("Enter"); await w(600); await st("Enter in palette");
await browser.close();
