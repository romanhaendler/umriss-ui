import {open,fillAll,logs,F,pickers} from "./drive.mjs";
import {state,active,focusEach} from "./probe.mjs";
const {b,p,errs}=await open("tanstack?"+(process.argv[2]||"onSubmit"));
if(process.argv[3]==="focus")console.log("refs focus:",JSON.stringify(await focusEach(p),null,1));
// A: blur on open of date picker, pristine
await F(p,"date").locator("button").first().click(); await p.waitForTimeout(300);
console.log("date error while panel open:",(await state(p)).date, JSON.stringify(await logs(p)));
await p.keyboard.press("Escape");
await p.screenshot({path:"shots/tanstack-"+(process.argv[2]||"onSubmit")+"-date-open-error.png"});
// B: pristine submit
await p.getByRole("button",{name:"Submit"}).click(); await p.waitForTimeout(500);
console.log("after pristine submit state:",JSON.stringify(await state(p)));
console.log("active:",await active(p),"log:",JSON.stringify(await logs(p)));
await p.screenshot({path:"shots/tanstack-"+(process.argv[2]||"onSubmit")+"-invalid.png",fullPage:true});
// C: fill all and submit; disabled during submit
await fillAll(p);
await p.getByRole("button",{name:"Submit"}).click();
await p.waitForTimeout(100);
console.log("during submit disabled count:",await p.locator("[data-field] :is(input,select,textarea,button)[disabled]").count(), "of", await p.locator("[data-field] :is(input,select,textarea,button)").count());
await p.waitForTimeout(800);
console.log("submitted:",await p.evaluate(()=>{const s=window.__submitted; if(!s)return "NONE"; const o={}; for(const k in s){const v=s[k]; o[k]=v instanceof Date?"Date "+v.toISOString():Array.isArray(v)?"Array "+JSON.stringify(v.map(x=>x instanceof File?"File "+x.name:x)):v&&typeof v==="object"?"obj "+Object.entries(v).map(([a,b])=>a+":"+(b instanceof Date?"Date "+b.toISOString():b)).join(","):typeof v+" "+JSON.stringify(v)} return JSON.stringify(o,null,1)}));
console.log("state after valid:",JSON.stringify(await state(p)));
// D: reset
await p.getByRole("button",{name:"Reset"}).click(); await p.waitForTimeout(300);
console.log("after reset:",JSON.stringify(await state(p)));
console.log("ui after reset:",await p.evaluate(()=>({text:document.querySelector("[data-field=text] input").value,qty:document.querySelector("[data-field=qty] input").value,city:document.querySelector("[data-field=city] input").value,color:document.querySelector("[data-field=color] select").value,agree:document.querySelector("[data-field=agree] input").checked,plan:[...document.querySelectorAll("[data-field=plan] input")].map(i=>i.checked),vol:document.querySelector("[data-field=volume] input").value,tags:document.querySelector("[data-field=tags] button").textContent,date:document.querySelector("[data-field=date] button").textContent,range:document.querySelector("[data-field=range] button").textContent,when:document.querySelector("[data-field=when] button").textContent,files:document.querySelector("[data-field=files]").textContent})));
await p.screenshot({path:"shots/tanstack-"+(process.argv[2]||"onSubmit")+"-reset.png",fullPage:true});
console.log(errs);
await b.close();
