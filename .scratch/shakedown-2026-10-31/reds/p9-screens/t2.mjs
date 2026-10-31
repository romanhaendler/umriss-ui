import { chromium } from "playwright";
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage(); const logs = [];
p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`[${m.type()}] ${m.text().slice(0, 200)}`); });
p.on("pageerror", (e) => logs.push("PAGEERR " + e.message.slice(0, 200)));
const say = console.log;
const go = async (r) => { await p.goto(`http://localhost:4380/#/${r}`); await p.waitForTimeout(300); };
await go("login");
await p.getByLabel("Email").fill("a@b.de"); await p.getByLabel("Password").fill("x");
const sb = p.getByRole("button", { name: "Sign in" }); await sb.focus(); await p.keyboard.press("Enter");
await p.waitForTimeout(100); say("focus while loading:", await p.evaluate(() => document.activeElement?.tagName), await sb.isDisabled(), await sb.getAttribute("aria-disabled"), await sb.getAttribute("aria-busy"));
await p.waitForTimeout(1200); say("focus after loading:", await p.evaluate(() => document.activeElement?.tagName));
say("alert:", await p.getByRole("alert").allTextContents());
await p.screenshot({ path: "shots/login-err.png" });
// terms invalid
await go("form"); await p.getByRole("button", { name: "Save" }).click();
say("terms aria-invalid:", await p.getByLabel("I accept the terms").getAttribute("aria-invalid"), "describedby:", await p.getByLabel("I accept the terms").getAttribute("aria-describedby"));
say("combobox invalid:", await p.getByRole("combobox").first().getAttribute("aria-invalid"));
// the form labels: 'Terms' FormField label vs checkbox label
say("fields labelled Terms:", await p.getByLabel("Terms").count());
// reset
await p.getByLabel("First name").fill("x");
await p.getByRole("button", { name: "Reset" }).click(); await p.waitForTimeout(200);  say("after reset first:", JSON.stringify(await p.getByLabel("First name").inputValue()), "errs:", await p.getByRole("alert").count());
// Slider default show value; number input
const age = p.getByLabel("Age", {exact:true}); await age.fill("abc"); await p.waitForTimeout(100); say("age after abc:", JSON.stringify(await age.inputValue()));
await age.fill("200"); await age.blur(); say("age 200 ->", await age.inputValue());
const sal = p.getByLabel("Salary"); await sal.fill("1234.5"); await sal.blur(); say("salary:", await sal.inputValue());
await p.getByRole("button",{name:/Date of birth/}).click(); await p.waitForTimeout(200); await p.screenshot({ path: "shots/form-date.png" });
await p.keyboard.press("Escape");
say("focus after Esc:", await p.evaluate(() => document.activeElement?.tagName+":"+document.activeElement?.getAttribute("aria-label")));
// Combobox typing
const cb = p.getByRole("combobox").first(); await cb.click(); await p.keyboard.type("sw"); await p.keyboard.press("Enter"); say("combobox:", await cb.inputValue());
// Textarea count
const ta = p.getByLabel("Bio"); await ta.fill("x".repeat(300)); say("bio len:", (await ta.inputValue()).length);
// Mobile
await p.setViewportSize({ width: 375, height: 800 }); await p.waitForTimeout(300);
await p.screenshot({ path: "shots/form-375.png", fullPage: true });
say("overflow375:", await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
await p.setViewportSize({ width: 1920, height: 1000 }); await p.waitForTimeout(300);
await p.screenshot({ path: "shots/form-1920.png", fullPage: true });
say("console", logs);
await b.close();
