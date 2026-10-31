import {chromium} from "playwright";
const b=await chromium.launch();
const pg=await (await b.newContext({locale:"en",viewport:{width:900,height:1800}})).newPage();
const errs=[]; pg.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.text())}); pg.on("pageerror",e=>errs.push("PE "+e.message));
await pg.goto("http://localhost:4330/rhf.html");
const focus=()=>pg.evaluate(()=>document.activeElement.tagName+"|"+(document.activeElement.name||document.activeElement.getAttribute("role")||document.activeElement.className.slice(0,20)));
for (const n of ["name","note","qty","sel","cb","ms","chk","sw","rg","sl","sc","d","r","dt"]) {
  await pg.evaluate(()=>document.body.focus()); 
  await pg.evaluate(n=>window.f.setFocus(n),n); await pg.waitForTimeout(50);
  console.log("setFocus",n,"->",await focus());
}
await pg.evaluate(()=>window.f.setFocus("name"));
// errors: clear name, clear qty
await pg.fill("input[name=name]",""); await pg.locator("input[inputmode], input").nth(2).click();
await pg.click("#sub"); await pg.waitForTimeout(200);
console.log("after invalid submit focus:",await focus(), "submitted",await pg.evaluate(()=>window.submitted.length));
console.log("errors:",await pg.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(window.f.formState.errors).map(([k,v])=>[k,v.message])))));
// fix, submit, check types
await pg.fill("input[name=name]","Bob"); await pg.click("#sub"); await pg.waitForTimeout(200);
console.log("submitted",JSON.stringify(await pg.evaluate(()=>window.submitted)));
// qty clear -> null? 
const q=pg.locator("input").nth(2);
console.log("qty input val",await q.inputValue());
await q.fill(""); await pg.waitForTimeout(100); console.log("qty after clear:",JSON.stringify(await pg.evaluate(()=>window.f.getValues("qty"))), await pg.evaluate(()=>JSON.stringify(window.f.formState.errors.qty?.message)));
// reset
await pg.fill("input[name=name]","zzz"); await pg.click("#rst"); await pg.waitForTimeout(200);
console.log("after reset:",JSON.stringify(await pg.evaluate(()=>window.f.getValues())), "name field",await pg.inputValue("input[name=name]"),"qty field",await q.inputValue());
console.log("dirty",await pg.locator("#dirty").innerText());
// action
await pg.click("#asub"); await pg.waitForTimeout(300); console.log("action keys",await pg.locator("#actout").innerText());
console.log(errs); await b.close();
