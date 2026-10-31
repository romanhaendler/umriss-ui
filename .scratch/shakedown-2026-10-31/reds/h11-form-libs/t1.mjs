import {open,fillAll,logs,F} from "./drive.mjs";
const {b,p,errs}=await open("tanstack");
try{ await fillAll(p);}catch(e){console.log("FILL FAIL",e.message.slice(0,400))}
await p.screenshot({path:"shots/tanstack-filled.png",fullPage:true});
console.log(JSON.stringify(await logs(p)));console.log(errs);
await b.close();
