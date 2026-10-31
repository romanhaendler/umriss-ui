import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:800}});
await p.goto("http://localhost:4380/#/admin"); await p.reload(); await p.waitForTimeout(400);
await p.getByRole("button",{name:"Next page"}).click(); await p.getByRole("button",{name:"Next page"}).click(); await p.waitForTimeout(300);
await p.getByRole("checkbox").nth(1).check(); // one row
await p.getByRole("button",{name:"Delete"}).first().click(); await p.waitForTimeout(200);
await p.getByRole("button",{name:"Delete",exact:true}).last().click(); await p.waitForTimeout(500);
const where = () => p.evaluate(()=>[...document.querySelectorAll("*")].filter(e=>e.children.length===0 && /\d+–\d+ of \d+/.test(e.textContent||"")).map(e=>e.tagName+"["+(e.parentElement?.getAttribute("role")||e.parentElement?.getAttribute("aria-live")||e.parentElement?.className.slice(0,25))+"] '"+e.textContent+"' visible="+(e.getBoundingClientRect().width>1)));
console.log("rows left:", await p.locator("tbody tr").count(), await where());
// palette closed: state kept?
await p.keyboard.press("Control+k"); await p.waitForTimeout(300);
await p.keyboard.type("set"); await p.waitForTimeout(200);
console.log("palette open dialog count open:", await p.locator("dialog[open]").count(), "focus:", await p.evaluate(()=>document.activeElement?.getAttribute("role")));
await p.keyboard.press("Enter"); await p.waitForTimeout(500);
console.log("route:", await p.evaluate(()=>location.hash), "focus:", await p.evaluate(()=>document.activeElement?.tagName+":"+document.activeElement?.getAttribute("aria-label")));
await p.keyboard.press("Control+k"); await p.waitForTimeout(300);
console.log("palette reopened input:", JSON.stringify(await p.locator("dialog[open] input").inputValue()));
await p.keyboard.press("Escape"); await p.waitForTimeout(400);
console.log("hidden palette input still in DOM:", await p.locator("input[role=combobox]").count());
await b.close();
