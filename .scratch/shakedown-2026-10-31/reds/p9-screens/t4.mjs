import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage();
await p.goto("http://localhost:4380/#/form"); await p.waitForTimeout(400);
console.log(await p.evaluate(()=>[...document.querySelectorAll("button[aria-haspopup],[role=combobox]")].map(e=>e.tagName+" lab="+e.getAttribute("aria-label")+" lby="+e.getAttribute("aria-labelledby")+" id="+e.id+" txt="+e.textContent.slice(0,20))));
console.log(await p.evaluate(()=>[...document.querySelectorAll("label")].map(l=>l.textContent+" for="+l.htmlFor)));
for (const n of ["Country","Date of birth","Languages","Role"]) console.log(n, await p.getByRole("combobox",{name:n}).count(), await p.getByRole("button",{name:new RegExp(n)}).count());
await b.close();
