import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:900,height:600}});
await p.goto("http://localhost:4380/#/settings"); await p.reload(); await p.waitForTimeout(400);
console.log(await p.getByRole("radio").first().evaluate(e=>{const s=e.nextElementSibling; const c=getComputedStyle(s||e); return e.outerHTML.slice(0,80)+" | "+(s&&s.className)+" radius="+c.borderRadius+" "+c.width}));
// Settings language toggle mid-tab: does tab stay?
await p.getByRole("tab",{name:"Notifications"}).click();
await p.getByRole("switch",{name:"DE"}).count();
await b.close();
