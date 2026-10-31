import {open,fillAll,F} from "./drive.mjs";
const {b,p}=await open("conform");
await fillAll(p);
const ui=()=>p.evaluate(()=>({text:document.querySelector("[data-field=text] input").value,qty:document.querySelector("[data-field=qty] input:not([aria-hidden])").value,city:document.querySelector("[data-field=city] input[role=combobox]").value,tags:document.querySelector("[data-field=tags] button").textContent,date:document.querySelector("[data-field=date] button").textContent,range:document.querySelector("[data-field=range] button").textContent,when:document.querySelector("[data-field=when] button").textContent,agree:document.querySelector("[data-field=agree] input").checked,plan:[...document.querySelectorAll("[data-field=plan] input")].map(i=>i.checked).join(),vol:document.querySelector("[data-field=volume] input").value,files:document.querySelector("[data-field=files]").textContent.slice(0,40),hidden:[...document.querySelectorAll("[aria-hidden=true][name]")].map(e=>e.name+"="+[...(e.selectedOptions||[])].map(o=>o.value).join("+")+e.value).join(" | ")}));
console.log("before submit",JSON.stringify(await ui()));
await p.getByRole("button",{name:"Submit"}).click(); await p.waitForTimeout(1200);
console.log("after submit ",JSON.stringify(await ui()));
await p.screenshot({path:"shots/conform-after-valid-submit.png",fullPage:true});
await b.close();
