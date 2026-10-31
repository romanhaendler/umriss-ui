import {open,active,openDialogs} from "./lib.mjs";
const {browser,page,errors}=await open("nest");
const st=async(l)=>console.log(l.padEnd(34),"focus=",await active(page),"dialogs=",JSON.stringify(await openDialogs(page)), "log=",(await page.textContent("#log")).slice(-30));
const w=(n=350)=>page.waitForTimeout(n);
// toast action -> modal
await page.click("#toast-modal"); await w(600); await st("toast shown");
await page.click("text=Review"); await w(600); await st("modal from toast action");
console.log("toast region in dialog?",await page.evaluate(()=>!![...document.querySelectorAll("dialog[open]")].find(d=>d.querySelector("[role=region]"))), "toast items", await page.evaluate(()=>document.querySelectorAll("[data-toast]").length));
await page.keyboard.press("Escape"); await w(); await st("escape -> focus where?");
// toast in modal then close modal
await page.click("#open-modal"); await w(); await page.click("#m-toast"); await w(500); 
console.log("toasts",await page.evaluate(()=>document.querySelectorAll("[data-toast]").length));
await page.keyboard.press("Escape"); await w(500); await st("closed modal w/ toast");
console.log("toast reachable after modal closed:", await page.evaluate(()=>{const e=[...document.querySelectorAll("[data-toast]")];return e.map(x=>({inDialog:!!x.closest("dialog"),inert:!!x.closest("[inert]"),rect:JSON.stringify(x.getBoundingClientRect())}))}));
// palette over modal
await page.click("#open-modal"); await w(); await page.keyboard.press("Control+k"); await w(); await st("ctrl+k in modal");
await page.click("#m-pal"); await w(500); await st("palette over modal"); 
await page.keyboard.type("set"); await page.keyboard.press("Enter"); await w(500); await st("palette choose");
await page.click("#m-pal"); await w(500); await page.keyboard.press("Escape"); await w(500); await st("palette escape");
// confirm over modal via menu
await page.click("#m-menu"); await w(); await page.click("text=Confirm over"); await w(500); await st("confirm over modal");
await page.keyboard.press("Escape"); await w(500); await st("confirm esc");
// popover with datepicker
await page.click("#m-pop"); await w(); 
await page.click("text=Select date"); await w(400); await st("datepicker panel open in popover");
await page.screenshot({path:"shots/dp-in-pop.png"});
await page.keyboard.press("Escape"); await w(); await st("esc 1 (picker)");
await page.keyboard.press("Escape"); await w(); await st("esc 2");
await page.keyboard.press("Escape"); await w(500); await st("esc 3");
console.log(errors);
await browser.close();
