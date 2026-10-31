import {open,active,openDialogs} from "./lib.mjs";
const w=(n=400)=>new Promise(r=>setTimeout(r,n));
const {browser,page,errors}=await open("tbl");
const st=async(l)=>console.log(l.padEnd(34),"dlg",JSON.stringify(await openDialogs(page)),"focus",await active(page));
const popups=()=>page.evaluate(()=>[...document.querySelectorAll("[role=menu],[role=dialog]:not(dialog),[role=listbox]")].map(e=>e.getAttribute("role")+":"+(e.getAttribute("aria-label")||"")+":"+e.parentElement.tagName));
await page.screenshot({path:"shots/tbl-inline.png"});
// column menu inline
await page.click("button:has-text('Columns')").catch(async()=>console.log("no Columns btn; buttons:",await page.evaluate(()=>[...document.querySelectorAll("button")].map(b=>b.textContent||b.getAttribute("aria-label")).slice(0,15))));
await w(); console.log("popups",await popups()); await st("column menu");
await page.screenshot({path:"shots/tbl-colmenu.png"});
await page.keyboard.press("Escape"); await w(); await st("esc");
// in drawer
await page.click("#open"); await w(500); await page.click("dialog[open] button:has-text('Columns')"); await w(); console.log("popups in drawer",await popups()); await st("colmenu in drawer");
await page.keyboard.press("Escape"); await w(); await st("esc1"); 
// row actions
const ra=page.locator("dialog[open] button[aria-label*='ction' i], dialog[open] button[aria-label*='More' i]").first();
console.log("row action btn count",await ra.count());
await ra.click(); await w(); console.log("popups",await popups()); await st("row actions menu");
await page.click("[role=menu] >> text=Details"); await w(500); await st("Details modal opened from row menu over drawer");
await page.keyboard.press("Escape"); await w(500); await st("esc: focus return");
await ra.click(); await w(); await page.click("[role=menu] >> text=Archive"); await w(500); await st("archive confirm over drawer");
await page.keyboard.press("Escape"); await w(500); await st("esc: focus return");
console.log(errors); await browser.close();
