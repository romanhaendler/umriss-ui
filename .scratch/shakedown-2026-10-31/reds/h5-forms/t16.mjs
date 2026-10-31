import {chromium} from "playwright";
const b=await chromium.launch();
const pg=await (await b.newContext({locale:"en",viewport:{width:900,height:1800}})).newPage();
const errs=[]; pg.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.text())}); pg.on("pageerror",e=>errs.push("PE "+e.message));
await pg.goto("http://localhost:4330/rhf.html"); await pg.waitForSelector("#sub");
const q=pg.locator("input[name=qty]");
const val=()=>pg.evaluate(()=>JSON.stringify([window.f.getValues("qty"),window.f.formState.errors.qty?.message,window.f.formState.isDirty]));
await q.fill(""); await pg.waitForTimeout(100); console.log("qty cleared:",await val());
await q.fill("0"); await pg.waitForTimeout(100); console.log("qty 0:",await val(), await q.inputValue());
await q.fill("7"); await pg.click("#rst"); await pg.waitForTimeout(150); console.log("reset after 7:",await val(),"field:",await q.inputValue());
await q.fill(""); await pg.click("#sub"); await pg.waitForTimeout(200); console.log("submit empty qty, focus:",await pg.evaluate(()=>document.activeElement.name),await val());
// reset after clearing
await pg.click("#rst"); await pg.waitForTimeout(150); console.log("reset after clearing:",await val(),"field:",JSON.stringify(await q.inputValue()));
// checkbox/switch reset
await pg.evaluate(()=>document.querySelector("input[name=chk]").click()); await pg.click("#rst"); await pg.waitForTimeout(100);
console.log("chk after reset checked:",await pg.evaluate(()=>document.querySelector("input[name=chk]").checked), await pg.evaluate(()=>window.f.getValues("chk")));
// late values: reset with new values
await pg.evaluate(()=>window.f.reset({name:"late",note:"",qty:null,sel:"a",cb:null,ms:[],chk:false,sw:false,rg:null,sl:60,sc:null,d:null,r:null,dt:new Date(2025,5,1,9,0)})); await pg.waitForTimeout(200);
console.log("late values:",await pg.evaluate(()=>JSON.stringify({n:document.querySelector("input[name=name]").value,q:document.querySelector("input[name=qty]").value,sel:document.querySelector("select").value,cb:document.querySelector("input[name=cb]").value,chk:document.querySelector("input[name=chk]").checked,sw:document.querySelector("input[name=sw]").checked,rg:[...document.querySelectorAll("input[name=rg]")].map(x=>x.checked),sl:document.querySelector("input[name=sl]").value,sc:[...document.querySelectorAll("input[name=sc]")].map(x=>x.checked),d:document.querySelector("button[name=d]").textContent,dt:document.querySelector("button[name=dt]").textContent})));
console.log(errs); await b.close();
