// Opens the DatePicker (screen #core) on 31 Oct 2026 (system date), presses PageUp: focus falls to BODY.
import { open } from "./lib.mjs";
const s = await open("core"); const p = s.page;
await p.getByRole("button", { name: "Date", exact: true }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
await p.keyboard.press("PageUp"); await p.waitForTimeout(200);
console.log("active after PageUp:", await p.evaluate(() => document.activeElement === document.body ? "BODY" : document.activeElement.getAttribute("aria-label")));
await p.keyboard.press("Escape"); await p.waitForTimeout(300);
console.log("dialog still open after Escape:", await p.locator("[role=dialog]:visible").count());
await s.close();
