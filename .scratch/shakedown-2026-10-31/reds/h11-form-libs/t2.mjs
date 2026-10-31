import {open,F} from "./drive.mjs";
const {b,p}=await open("tanstack");
await F(p,"volume").locator("input").fill("60");
console.log(await F(p,"view").evaluate(e=>e.outerHTML.slice(0,1500)));
await F(p,"view").getByText("B",{exact:true}).click({timeout:3000,trial:true}).catch(e=>console.log(e.message.slice(0,800)));
await b.close();
