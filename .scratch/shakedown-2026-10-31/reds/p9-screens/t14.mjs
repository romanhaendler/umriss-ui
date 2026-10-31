import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:900,height:600}, deviceScaleFactor:3});
await p.goto("http://localhost:4380/#/wizard"); await p.reload(); await p.waitForTimeout(300);
await p.getByLabel("Company").fill("Acme"); await p.getByRole("button",{name:"Next"}).click(); await p.waitForTimeout(300);
await p.screenshot({path:"shots/radio-zoom.png", clip:{x:20,y:120,width:200,height:100}});
console.log(await p.evaluate(()=>[...document.querySelectorAll("input[type=radio]")].map(e=>{const r=e.parentElement; return [...r.querySelectorAll("*")].map(x=>x.className.slice(0,12)+":"+getComputedStyle(x).borderRadius).join(" ")})));
await b.close();
