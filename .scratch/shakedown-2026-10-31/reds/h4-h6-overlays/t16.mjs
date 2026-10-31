import {open,active,openDialogs} from "./lib.mjs";
const w=(n=400)=>new Promise(r=>setTimeout(r,n));
const {browser,page,errors}=await open("tbl");
const st=async(l)=>console.log(l.padEnd(38),"dlg",JSON.stringify(await openDialogs(page)),"focus",await active(page));
await page.click("#open"); await w(500);
await page.click("dialog[open] button[aria-label='Details: R-1002']"); await w(500); await st("Details from row action in drawer");
await page.keyboard.press("Escape"); await w(500); await st("esc -> focus return");
await page.click("dialog[open] button[aria-label='Archive: R-1002']"); await w(500); await st("archive confirm over drawer");
await page.keyboard.press("Escape"); await w(500); await st("esc -> focus return");
// filter popover in drawer
await page.click("dialog[open] button[aria-label*='ilter']:visible >> nth=0").catch(e=>console.log("filter btn?",e.message.split("\n")[0]));
await w(); await st("filter opened?");
console.log("popups",await page.evaluate(()=>[...document.querySelectorAll("[role=dialog]:not(dialog),[role=menu],[role=listbox]")].map(e=>e.getAttribute("role")+":"+e.getAttribute("aria-label"))));
await page.keyboard.press("Escape"); await w(); await st("esc after filter");
// cut value tip: hover on cut cell inside drawer
await page.hover("dialog[open] tbody tr:nth-child(2) td:nth-child(5)"); await w(900);
console.log("tooltips",await page.evaluate(()=>[...document.querySelectorAll("[role=tooltip]")].map(e=>e.textContent.slice(0,30)+" in "+e.parentElement.tagName+" topLayer="+e.matches(":popover-open"))));
await page.screenshot({path:"shots/tbl-drawer-tip.png"});
await page.keyboard.press("Escape"); await w(); await st("esc after tip");
console.log(errors); await browser.close();
