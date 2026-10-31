import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:800}}); const logs=[];
p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(m.text().slice(0,200).replace(/\n/g," ")); });
p.on("pageerror", (e) => logs.push("PAGEERR " + e.message.slice(0, 200)));
const say=console.log; const go = async (r) => { await p.goto(`http://localhost:4380/#/${r}`); await p.reload(); await p.waitForTimeout(300); };
const act = () => p.evaluate(() => { const e=document.activeElement; return e?.tagName+":"+(e?.getAttribute("aria-label")||e?.textContent?.slice(0,20)||e?.id); });
// wizard
await go("wizard");
say("step0 focus:", await act());
await p.getByLabel("Company").fill("Acme"); await p.getByRole("button",{name:"Next"}).click();
say("after Next focus:", await act());
say("stepper current:", await p.locator("[aria-current]").allTextContents());
await p.getByRole("radio",{name:"Large"}).check(); await p.getByRole("button",{name:"Next"}).click();
await p.getByRole("button",{name:"Back"}).click(); say("back, plan kept:", await p.getByRole("radio",{name:"Large"}).isChecked());
await p.getByRole("button",{name:"Next"}).click(); await p.getByRole("button",{name:"Create"}).click();
say("dialog open:", await p.getByRole("dialog").count(), "focus:", await act());
await p.keyboard.press("Escape"); await p.waitForTimeout(400); say("esc -> focus:", await act());
await p.screenshot({path:"shots/wizard.png"});
// notifications
await go("notifications");
await p.getByRole("button",{name:"burst 8"}).click(); await p.waitForTimeout(300);
say("toasts after burst:", await p.locator("[role=status] li, [data-toast], [role=alert]").count());
await p.screenshot({path:"shots/notif-burst.png"});
await p.getByRole("button",{name:"loading"}).click(); await p.waitForTimeout(2000);
await p.getByRole("button",{name:"sticky + action"}).click(); await p.waitForTimeout(300);
await p.getByRole("button",{name:"Undo"}).click(); await p.waitForTimeout(500);
say("undo clicked; toast with Undo left:", await p.getByRole("button",{name:"Undo"}).count());
const m = p.getByRole("button",{name:"Actions for Message 1"}); await m.click(); await p.getByRole("menuitem",{name:"Mark read"}).click(); await p.waitForTimeout(200);
say("focus after menu choose:", await act());
await p.getByRole("button",{name:"Actions for Message 2"}).click(); await p.getByRole("menuitem",{name:"Delete"}).click(); await p.waitForTimeout(200);
say("focus after delete item:", await act());
for (const n of [1,3,4]) { const bt=p.getByRole("button",{name:`Actions for Message ${n}`}); if(await bt.count()){ await bt.click(); await p.getByRole("menuitem",{name:"Delete"}).click(); await p.waitForTimeout(150);} }
say("empty:", await p.getByText("No notifications").count(), "focus:", await act());
say("logs", logs.splice(0));
// upload
await go("upload");
const fi = p.locator("input[type=file]");
await fi.setInputFiles([{name:"a.pdf",mimeType:"application/pdf",buffer:Buffer.from("x")},{name:"b.png",mimeType:"image/png",buffer:Buffer.from("y")},{name:"c.exe",mimeType:"application/x-msdownload",buffer:Buffer.from("z")}]);
await p.waitForTimeout(200);
say("files listed:", await p.locator("text=/\\.(pdf|png|exe)/").allTextContents());
await p.getByRole("button",{name:"Upload"}).click(); await p.waitForTimeout(900);
await p.screenshot({path:"shots/upload.png"});
// choose the same file again
await fi.setInputFiles([{name:"a.pdf",mimeType:"application/pdf",buffer:Buffer.from("x")}]); await p.waitForTimeout(200);
say("after reselecting a.pdf:", await p.locator("text=/\\.(pdf|png)/").allTextContents());
say("logs", logs.splice(0));
await b.close();
