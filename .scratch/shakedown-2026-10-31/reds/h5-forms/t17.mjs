import {chromium} from "playwright";
import fs from "fs";
fs.writeFileSync("/tmp/x.txt","hello");
const b=await chromium.launch();
const pg=await (await b.newContext({locale:"en",viewport:{width:600,height:1100}})).newPage();
const errs=[]; pg.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.text())}); pg.on("pageerror",e=>errs.push("PE "+e.message));
await pg.goto("http://localhost:4330/unc.html"); await pg.waitForSelector("#sub"); await pg.waitForTimeout(500);
await pg.screenshot({path:"shots/unc.png"});
const log=()=>pg.evaluate(()=>JSON.stringify(window.log.splice(0)));
const fd=async()=>{await pg.evaluate(()=>{const f=document.getElementById("u");f.requestSubmit?.()}); return pg.evaluate(()=>JSON.stringify(window.fd))};
await pg.evaluate(()=>{const f=document.getElementById("u");f.noValidate=true});
console.log("FD initial",await fd());
await pg.click("label:has-text('Alpha')"); await pg.locator("input[name=sc][value=a]").evaluate(e=>e.click());
await pg.locator("input[name=sl]").focus(); await pg.keyboard.press("ArrowRight"); await pg.keyboard.press("End");
await pg.locator("input[name=chk]").check(); 
console.log("log",await log());
await pg.setInputFiles("input[name=file]","/tmp/x.txt"); await pg.waitForTimeout(100);
console.log("FD after changes",await fd());
await pg.click("#rst"); await pg.waitForTimeout(200);
console.log("FD after reset",await fd(),"file list",await pg.locator("input[name=file]").evaluate(e=>e.files.length),"ui text",await pg.locator("form").innerText().then(t=>t.includes("x.txt")));
// validation
console.log("req validity",await pg.evaluate(()=>[document.querySelector("input[name=req]").validity.valid, document.querySelector("select[name=sel]").validity.valid, document.querySelector("input[name=req]").getAttribute("aria-invalid"), document.querySelector("input[name=req]").getAttribute("aria-describedby")]));
await pg.evaluate(()=>document.getElementById("u").noValidate=false);
await pg.click("#sub"); await pg.waitForTimeout(200); console.log("native validation focus:",await pg.evaluate(()=>document.activeElement.name));
// range min/max
await pg.locator("button[name=rng]").click(); await pg.waitForTimeout(200);
console.log("disabled day cells:",await pg.evaluate(()=>[...document.querySelectorAll("[role=dialog] button")].filter(x=>/^\d+$/.test(x.textContent)).map(x=>x.textContent+(x.disabled||x.getAttribute("aria-disabled")?"x":"")).join(" ")));
console.log(errs); await b.close();
