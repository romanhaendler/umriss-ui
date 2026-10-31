import {open,fillAll,F} from "./drive.mjs";
const {b,p}=await open("conform");
await F(p,"files").locator("input[type=file]").setInputFiles({name:"a.txt",mimeType:"text/plain",buffer:Buffer.from("hi")});
const f=()=>p.evaluate(()=>({n:document.querySelector("[data-field=files] input[type=file]").files.length,list:document.querySelector("[data-field=files]").textContent.slice(35,60)}));
console.log("chosen",JSON.stringify(await f()));
await p.evaluate(()=>document.querySelector("form").reset()); await p.waitForTimeout(200);
console.log("after form.reset()",JSON.stringify(await f()));
await b.close();
