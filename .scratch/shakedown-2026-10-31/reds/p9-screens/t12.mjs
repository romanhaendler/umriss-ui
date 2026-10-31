import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:900,height:600}});
await p.goto("http://localhost:4380/#/wizard"); await p.reload(); await p.waitForTimeout(400);
await p.getByRole("switch",{name:"Dark"}).check(); await p.waitForTimeout(300);
await p.screenshot({path:"shots/wizard-dark.png", clip:{x:0,y:60,width:700,height:300}});
await p.getByRole("button",{name:"Next"}).evaluate(e=>console.log("x"));
console.log(await p.getByRole("button",{name:"Next"}).evaluate(e=>{const c=getComputedStyle(e); return c.backgroundColor+" "+c.color+" op="+c.opacity}));
await b.close();
