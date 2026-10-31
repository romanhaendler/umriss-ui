import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:800}});
await p.goto("http://localhost:4380/#/form"); await p.waitForTimeout(400);
const age = p.getByRole("textbox",{name:"Age",exact:true});
const st = async (t)=>console.log(t, JSON.stringify(await age.inputValue()), await age.evaluate(e=>{const w=e.parentElement; return getComputedStyle(w).boxShadow.slice(0,70)})); 
await age.fill("abc"); await p.waitForTimeout(100); await age.fill("200"); await age.blur();
for (const t of [100,1000,3000,6000]) { await p.waitForTimeout(t); await st("t+"+t); }
await age.focus(); await age.fill("300"); await age.blur(); await p.waitForTimeout(3000); await st("300 again");
await p.screenshot({path:"shots/age-red.png", clip:{x:900,y:130,width:380,height:80}});
await b.close();
