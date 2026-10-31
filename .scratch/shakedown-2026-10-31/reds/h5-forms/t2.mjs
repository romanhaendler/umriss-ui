import {chromium} from "playwright";
const b=await chromium.launch();
const lang=process.argv[2]||"en";
const pg=await (await b.newContext({locale:lang})).newPage();
const errs=[]; pg.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.text())}); pg.on("pageerror",e=>errs.push("PE "+e.message));
await pg.goto("http://localhost:4330/?lang="+lang);
const sub=async()=>{await pg.click("button[type=submit]");return await pg.locator("#out").innerText()};
console.log("INITIAL FD",await sub());
const num=pg.locator("input[name=num]");
for (const t of ["150","-5","1.005","2.345","0.3","7.777","99.999"]) {
  await num.fill(""); await pg.evaluate(()=>window.log.length=0); await num.click(); await pg.keyboard.insertText(t);
  const e=await pg.evaluate(()=>JSON.stringify(window.log.filter(x=>x[0]=="num").map(x=>x[1])));
  await pg.keyboard.press("Tab"); console.log("num",t,"emit",e,"blur",await num.inputValue(), "FD", (await sub()).match(/\["num","[^"]*"\]/)?.[0]);
}
await num.fill("0.3"); await num.press("Tab"); await num.focus(); await num.press("ArrowUp"); console.log("0.3 up",await num.inputValue()); await num.press("Shift+ArrowUp"); console.log("shift up",await num.inputValue());
await num.fill("99.9"); await num.press("ArrowUp"); console.log("99.9 up",await num.inputValue()); await num.press("ArrowUp");console.log("up again",await num.inputValue());
await num.fill(""); await num.press("ArrowUp"); console.log("empty up",await num.inputValue()); await num.fill(""); await num.press("ArrowDown"); console.log("empty down",await num.inputValue());
// parent replace while typing
await num.fill(""); await num.click(); await pg.keyboard.type("12"); await pg.evaluate(()=>document.getElementById("parent").click()); console.log("after parent while typing",await num.inputValue(), "focus on", await pg.evaluate(()=>document.activeElement.id||document.activeElement.name));
await num.click(); await pg.keyboard.type("3"); console.log("then typed 3",await num.inputValue());
console.log("errs",errs);
await b.close();
