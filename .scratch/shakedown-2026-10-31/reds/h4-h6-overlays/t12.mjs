import {open,active,openDialogs} from "./lib.mjs";
import {chromium} from "playwright";
const w=(n=400)=>new Promise(r=>setTimeout(r,n));
const {browser,page,errors}=await open("x"); 
await page.goto("http://127.0.0.1:4320/multi.html"); await w(1500);
// 1 two roots: id collisions
await page.click("#m-A"); await w();
console.log("two roots: dialog aria-labelledby ids:",await page.evaluate(()=>[...document.querySelectorAll("dialog")].map(d=>d.getAttribute("aria-labelledby")+" -> "+(document.getElementById(d.getAttribute("aria-labelledby"))?.closest("dialog")===d?"own":"OTHER/none"))));
await page.keyboard.press("Escape"); await w();
await page.click("#m-B"); await w();
console.log("B open: labelledby resolves to own?",await page.evaluate(()=>[...document.querySelectorAll("dialog")].filter(d=>d.open).map(d=>d.getAttribute("aria-labelledby")+" -> "+(document.getElementById(d.getAttribute("aria-labelledby"))?.closest("dialog")===d?"own":"OTHER"))), "accessible name", JSON.stringify(await page.evaluate(()=>{const d=[...document.querySelectorAll("dialog")].find(d=>d.open);return document.getElementById(d.getAttribute("aria-labelledby"))?.textContent})));
await page.keyboard.press("Escape"); await w();
// popovers from two roots: Escape closes both? outside click
await page.click("#p-A"); await w(); await page.evaluate(()=>document.getElementById("p-B").click()); await w();
console.log("popovers A,B open:",await page.evaluate(()=>[!!document.getElementById("pp-A"),!!document.getElementById("pp-B")]));
await page.keyboard.press("Escape"); await w();
console.log("after 1 Esc:",await page.evaluate(()=>[!!document.getElementById("pp-A"),!!document.getElementById("pp-B")]));
await page.keyboard.press("Escape"); await w();
// two copies
await page.click("#p-A"); await w(); await page.evaluate(()=>document.getElementById("p-copy2").click()); await w();
console.log("copy: A, copy2 open:",await page.evaluate(()=>[!!document.getElementById("pp-A"),!!document.getElementById("pp-copy2")]));
await page.keyboard.press("Escape"); await w();
console.log("two copies after 1 Esc:",await page.evaluate(()=>[!!document.getElementById("pp-A"),!!document.getElementById("pp-copy2")]),"(one copy should close only the top)");
await page.keyboard.press("Escape"); await w();
// shadow
await page.click("#menu-S"); await w(); 
console.log("shadow menu item present:",await page.evaluate(()=>!!document.getElementById("host").shadowRoot.getElementById("mi-S")));
await page.click("#mi-S",{timeout:2000}).then(()=>console.log("shadow: clicked item, sel=",""),e=>console.log("shadow item click fail"));
console.log("sel",await page.evaluate(()=>window.__sel));
await page.click("#p-S"); await w(); await page.click("#pp-S"); await w(); console.log("shadow popover survives inside click:",await page.evaluate(()=>!!document.getElementById("host").shadowRoot.getElementById("pp-S")));
await page.keyboard.press("Escape"); await w();
await page.click("#m-S"); await w(); console.log("shadow modal open:",await page.evaluate(()=>document.getElementById("host").shadowRoot.querySelector("dialog")?.open),"focus in shadow:",await page.evaluate(()=>document.getElementById("host").shadowRoot.activeElement?.outerHTML.slice(0,60)));
await page.screenshot({path:"shots/shadow-modal.png"});
await page.keyboard.press("Escape"); await w(500); console.log("shadow modal after esc open?",await page.evaluate(()=>document.getElementById("host").shadowRoot.querySelector("dialog")?.open),"focus",await page.evaluate(()=>document.getElementById("host").shadowRoot.activeElement?.id));
// iframe
const f=page.frameLocator("#fr");
await f.locator("#menu-F").click(); await w(); console.log("iframe menu item:",await f.locator("#mi-F").count());
await f.locator("#mi-F").click({timeout:2000}).catch(()=>console.log("iframe item click fail")); console.log("sel",await page.evaluate(()=>window.__sel));
await f.locator("#p-F").click(); await w(); await f.locator("#pp-F").click(); await w(); console.log("iframe popover survives inner click:",await f.locator("#pp-F").count());
await page.keyboard.press("Escape"); await w();
await f.locator("#m-F").click(); await w(); console.log("iframe modal open:",await page.frame({url:/srcdoc|about:blank/}) ? "frame": "");
await page.keyboard.press("Escape"); await w(500);
console.log("iframe modal left?",await f.locator("dialog[open]").count());
await page.screenshot({path:"shots/multi.png"});
console.log(errors); await browser.close();
