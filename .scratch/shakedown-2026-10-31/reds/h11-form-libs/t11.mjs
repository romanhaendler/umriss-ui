import {open,fillAll,F,pickers} from "./drive.mjs";
const {b,p,errs}=await open("conform?native");
await F(p,"qty").locator("input").fill("1234.5"); await F(p,"qty").locator("input").blur();
console.log("qty display:",await F(p,"qty").locator("input").inputValue());
await F(p,"city").locator("input[role=combobox]").click(); await F(p,"city").locator("input[role=combobox]").fill("Be"); await p.locator("[role=listbox] [role=option]").filter({hasText:"Beta"}).click();
await F(p,"tags").locator("button").first().click(); await p.getByRole("dialog").getByText("Alpha").first().click(); await p.getByRole("dialog").getByText("Gamma").first().click(); await p.keyboard.press("Escape");
await pickers(p,"date"); await pickers(p,"range"); await pickers(p,"when");
await F(p,"files").locator("input[type=file]").setInputFiles({name:"a.txt",mimeType:"text/plain",buffer:Buffer.from("hi")});
await p.getByRole("button",{name:"Submit"}).click(); await p.waitForTimeout(400);
console.log(JSON.stringify(await p.evaluate(()=>window.__fd)));
// the DOM of name attrs
console.log(await p.evaluate(()=>[...document.querySelectorAll("[name]")].map(e=>e.tagName+":"+(e.type||"")+"="+e.name).join(" ")));
console.log(errs);
await b.close();
