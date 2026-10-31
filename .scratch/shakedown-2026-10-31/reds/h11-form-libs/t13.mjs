import {open,fillAll,F,logs} from "./drive.mjs";
import {state,active} from "./probe.mjs";
const {b,p,errs}=await open("conform");
const sh=async(l)=>console.log(l,JSON.stringify(Object.fromEntries(Object.entries(await state(p)).map(([k,v])=>[k,v.msg.startsWith("hint")?"ok":v.msg.slice(0,18)+"|"+v.inv]))));
await p.getByRole("button",{name:"Submit"}).click(); await p.waitForTimeout(500); await sh("after invalid submit");
await fillAll(p); await p.waitForTimeout(300); await sh("after filling (before 2nd submit)");
await p.getByRole("button",{name:"Submit"}).click(); await p.waitForTimeout(1000); await sh("after valid submit");
await b.close();
