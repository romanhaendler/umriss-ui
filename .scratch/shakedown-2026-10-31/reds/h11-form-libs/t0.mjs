import {chromium} from "playwright";
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:2200}});
const errs=[]; p.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.text())}); p.on("pageerror",e=>errs.push("PAGEERR "+e.message));
await p.goto("http://localhost:4400/#"+(process.argv[2]||"tanstack")); await p.waitForSelector("[data-field=text]");
await p.screenshot({path:"shots/"+(process.argv[2]||"tanstack")+"-initial.png",fullPage:true});
console.log(errs);
for (const f of await p.locator("[data-field]").all()) console.log(await f.getAttribute("data-field"), (await f.locator("input,button,select,textarea,[role=radiogroup]").evaluateAll(e=>e.map(x=>x.tagName+(x.getAttribute("type")?":"+x.getAttribute("type"):"")+(x.getAttribute("role")?"["+x.getAttribute("role")+"]":"")+(x.name?" name="+x.name:"")))).join(" | "));
await b.close();
