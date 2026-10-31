import {chromium} from "playwright";
const b=await chromium.launch(); 
const out=[];
for (const lang of ["en","de","fr-CH"]) {
  const pg=await (await b.newContext({locale:lang==="fr-CH"?"fr-CH":lang})).newPage();
  const errs=[]; pg.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.text())}); pg.on("pageerror",e=>errs.push("PE "+e.message));
  await pg.goto("http://localhost:4330/?lang="+lang);
  const inp=pg.locator("#numfree");
  for (const t of ["1.234,56","1,234.56"," 12 ","1234.5","1'234.56","1 234,56","-5","1e3","abc","12.","0,5","١٢"]) {
    await inp.fill(""); await pg.evaluate(()=>window.log.length=0);
    await inp.click(); await pg.keyboard.insertText(t); 
    const mid=await inp.inputValue(); const emitted=await pg.evaluate(()=>JSON.stringify(window.log.filter(x=>x[0]=="numfree").map(x=>x[1])));
    await pg.keyboard.press("Tab"); const after=await inp.inputValue();
    const st=await pg.locator("#state").innerText();
    out.push([lang,JSON.stringify(t),"typed->",mid,"emit",emitted,"blur->",after, st.slice(0,12)].join(" | "));
  }
  out.push(lang+" errs "+JSON.stringify(errs));
  await pg.context().close();
}
console.log(out.join("\n")); await b.close();
