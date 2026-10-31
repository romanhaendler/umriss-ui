import {open,active,openDialogs} from "./lib.mjs";
const {browser,page,errors}=await open("nest");
const st=async(l)=>console.log(l.padEnd(34),"focus=",await active(page),"dialogs=",JSON.stringify(await openDialogs(page)), "log=",await page.textContent("#log"));
// 1 modal autofocus + return focus
await page.click("#open-modal"); await page.waitForTimeout(300); await st("modal open (autoFocus input)");
await page.keyboard.press("Escape"); await page.waitForTimeout(400); await st("after Escape");
// 2 menu -> modal
await page.click("#menu-trig"); await page.waitForTimeout(200); await st("menu open");
await page.click("#mi-modal"); await page.waitForTimeout(400); await st("modal from menu item");
await page.keyboard.press("Escape"); await page.waitForTimeout(400); await st("escape: return to?");
// 3 drawer>modal>menu
await page.click("#open-drawer"); await page.waitForTimeout(300); await st("drawer");
await page.click("#d-open-modal"); await page.waitForTimeout(300); await st("modal in drawer");
await page.click("#m-menu"); await page.waitForTimeout(300); await st("menu in modal in drawer");
await page.keyboard.press("Escape"); await page.waitForTimeout(300); await st("esc 1 (menu)");
await page.click("#m-pop"); await page.waitForTimeout(300); await st("popover dialog");
await page.click("#p-select"); await page.waitForTimeout(200); await st("clicked native select");
await page.keyboard.press("Escape"); await page.waitForTimeout(300); await st("esc (select/popover?)");
await page.keyboard.press("Escape"); await page.waitForTimeout(500); await st("esc 2");
await page.keyboard.press("Escape"); await page.waitForTimeout(500); await st("esc 3");
await page.keyboard.press("Escape"); await page.waitForTimeout(500); await st("esc 4");
await page.screenshot({path:"shots/nest-end.png"});
console.log(errors);
await browser.close();
