import {chromium} from "playwright";
const b=await chromium.launch();
const pg=await (await b.newContext({locale:"en",viewport:{width:600,height:700}})).newPage();
const errs=[]; pg.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.type()+": "+m.text().slice(0,250))}); pg.on("pageerror",e=>errs.push("PE "+e.message.slice(0,250)));
await pg.goto("http://localhost:4330/edge.html"); await pg.waitForTimeout(2500); await pg.reload(); await pg.waitForTimeout(1000);
console.log(await pg.evaluate(()=>[...document.querySelectorAll("input,button[name]")].map(e=>(e.name||e.tagName)+"="+(e.value??"")+"|"+e.textContent.slice(0,15)+(e.checked?" CHECKED":"")).join("\n")));
await pg.evaluate(()=>window.setLate("b")); await pg.waitForTimeout(200);
console.log("late b",await pg.evaluate(()=>[...document.querySelectorAll("input[type=radio]")].map(e=>e.name+e.value+e.checked).join(" ")));
console.log(errs); await b.close();
