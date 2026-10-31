import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage();
await p.goto("http://localhost:4380/#/login"); await p.waitForTimeout(400);
console.log(await p.evaluate(()=>{const i=document.querySelector("input[role=combobox]"); const d=i?.closest("dialog"); return {exists:!!i, inDialog:!!d, open:d?.open, vis: i&&getComputedStyle(i).display, dlg:d&&getComputedStyle(d).display}}));
console.log("dialogs in DOM:", await p.locator("dialog").count());
await b.close();
