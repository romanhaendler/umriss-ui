/* `pnpm docs`: the documentation, built from this checkout and served on this
   machine at the site's address (packages/demo/src/address.ts). It builds
   every time - after another tag is checked out, the site shown is that
   tag's, never the previous one's - and then serves `site/` until stopped.

   A port that is taken is an error naming it: another `pnpm docs` may be
   running, and it would show the documentation of another checkout. */

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../packages/demo/src/address.ts";
import { siteServer } from "../packages/demo/src/tooling/serve.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { port, pathname } = new URL(SITE);

execFileSync(process.execPath, ["--disable-warning=ExperimentalWarning", "--experimental-strip-types", join(ROOT, "scripts", "build-site.mjs")], { cwd: ROOT, stdio: "inherit" });

const server = siteServer(join(ROOT, "site"), pathname);
server.on("error", (error) => {
  console.error(error.code === "EADDRINUSE" ? `Port ${port} is taken. Stop what is using it - another \`pnpm docs\`, perhaps - and run this again.` : error);
  process.exit(1);
});
server.listen(Number(port), "127.0.0.1", () => console.log(`\nThe documentation is ready: ${SITE}\nStop it with Ctrl+C.`));
