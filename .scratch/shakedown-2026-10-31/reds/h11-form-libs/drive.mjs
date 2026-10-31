import {chromium} from "playwright";
export const URL="http://localhost:4400/#";
export async function open(lib,{w=900,h=2400}={}){
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:w,height:h}});
  const errs=[]; p.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.type()+": "+m.text().slice(0,300))}); p.on("pageerror",e=>errs.push("PAGEERR "+e.message.slice(0,300)));
  p.setDefaultTimeout(5000); await p.goto(URL+lib); await p.reload(); await p.waitForSelector("[data-field=text]");
  return {b,p,errs};
}
export const F=(p,n)=>p.locator(`[data-field=${n}]`);
export const logs=(p)=>p.evaluate(()=>window.__log.splice(0));
export async function pickers(p,n,{day=10,second=15,apply=false}={}){
  await F(p,n).locator("button").first().click();
  const pop=p.locator("[role=dialog]").last();
  await pop.waitFor();
  await pop.getByRole("gridcell",{name:new RegExp(`\\b${day}\\b`)}).first().click().catch(async()=>{await pop.locator("button",{hasText:new RegExp(`^${day}$`)}).first().click()});
  if(n==="range") await pop.getByRole("gridcell",{name:new RegExp(`\\b${second}\\b`)}).first().click().catch(async()=>{await pop.locator("button",{hasText:new RegExp(`^${second}$`)}).first().click()});
  if(n==="when") await pop.getByRole("button",{name:/apply/i}).click();
  await p.waitForTimeout(150);
  if(await pop.isVisible().catch(()=>false)) { await p.keyboard.press("Escape"); await p.waitForTimeout(150); }
}
export async function fillAll(p){
  await F(p,"text").locator("input").fill("hello");
  await F(p,"notes").locator("textarea").fill("some notes");
  await F(p,"qty").locator("input:not([aria-hidden])").fill("5"); 
  await F(p,"color").locator("select").selectOption("b");
  const cb=F(p,"city").locator("input[role=combobox]"); await cb.click(); await cb.fill("Be"); await p.locator("[role=listbox] [role=option]").filter({hasText:"Beta"}).click();
  await F(p,"tags").locator("button").first().click(); await p.getByRole("dialog").getByText("Alpha").first().click(); await p.getByRole("dialog").getByText("Gamma").first().click(); await p.keyboard.press("Escape");
  await F(p,"agree").locator("input").check();
  await F(p,"plan").getByText("Gamma").click();
  await F(p,"notify").locator("input").check();
  await F(p,"volume").locator("input").fill("60");
  await F(p,"view").locator("input[value=b]").click();
  await pickers(p,"date"); await pickers(p,"range"); await pickers(p,"when");
  await F(p,"files").locator("input[type=file]").setInputFiles({name:"a.txt",mimeType:"text/plain",buffer:Buffer.from("hi")});
}
