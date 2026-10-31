import { chromium } from "playwright";
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage(); const logs = [];
p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`[${m.type()}] ${m.text().slice(0, 200)}`); });
p.on("pageerror", (e) => logs.push("PAGEERR " + e.message.slice(0, 200)));
const say = (...a) => console.log(...a);
const go = async (r) => { await p.goto(`http://localhost:4380/#/${r}`); await p.waitForTimeout(300); };
const overflow = async (n) => { const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (o > 0) say("OVERFLOW", n, o); };
// login
await go("login");
await p.getByLabel("Email").fill("bad"); await p.getByLabel("Password").fill("x");
say("email invalid:", await p.getByLabel("Email").getAttribute("aria-invalid"));
const sb = p.getByRole("button", { name: "Sign in" }); await sb.focus(); await p.keyboard.press("Enter");
await p.waitForTimeout(100); say("focus while loading:", await p.evaluate(() => document.activeElement?.tagName + ":" + document.activeElement?.textContent));
await p.waitForTimeout(1200); say("focus after loading:", await p.evaluate(() => document.activeElement?.tagName));
await p.getByLabel("Remember me").check(); say("checked remember ok");
await p.screenshot({ path: "shots/login.png" });
// wrong -> alert
say("alert role:", await p.getByRole("alert").count());
// settings
await go("settings");
await p.getByRole("tab", { name: "Notifications" }).click();
await p.getByLabel("mail").uncheck(); await p.getByLabel("push").check();
await p.getByRole("tab", { name: "General" }).click();
await p.getByLabel("Dark mode").check(); await p.waitForTimeout(200);
await p.screenshot({ path: "shots/settings-dark.png" });
await p.getByLabel("Deutsch").check(); await p.waitForTimeout(200);
await p.screenshot({ path: "shots/settings-de.png" });
say("tabs after lang:", await p.getByRole("tab").allTextContents());
await p.getByLabel("Deutsch").uncheck(); await p.getByLabel("Dark mode").uncheck();
// form
await go("form");
await p.getByRole("button", { name: "Save" }).click(); await p.waitForTimeout(200);
say("errors:", await p.getByRole("alert").allTextContents());
await p.screenshot({ path: "shots/form-errors.png", fullPage: true });
say("invalid counts:", await p.locator("[aria-invalid=true]").count());
const links = p.getByRole("alert").getByRole("link");
for (let i = 0; i < await links.count(); i++) { await links.nth(i).click(); say(" link", i, "->", await p.evaluate(() => document.activeElement?.tagName + "|" + (document.activeElement?.getAttribute("name") ?? document.activeElement?.getAttribute("role") ?? document.activeElement?.className.slice(0, 20)))); }
await p.getByLabel("First name").fill("A"); await p.getByLabel("Terms").check().catch((e) => say("terms check fail", e.message.slice(0, 80)));
await overflow("form");
say("console", logs.splice(0));
await b.close();
