// run with vite dev on 4380: Checkbox in FormField error has no aria-invalid
import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage();
await p.goto("http://localhost:4380/#/form"); await p.reload();
await p.getByRole("button",{name:"Save"}).click();
console.log("terms aria-invalid:", await p.getByRole("checkbox",{name:/accept the terms/}).getAttribute("aria-invalid"));
await b.close();
