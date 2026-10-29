/* `pnpm start`: the documentation, built from this checkout and served on this
   machine at the site's address (packages/demo/src/address.ts). It starts listening, then builds
   every time - after another tag is checked out, the site shown is that
   tag's, never the previous one's - and then serves `site/` until stopped.

   A port that is taken is an error naming it: another `pnpm start` may be
   running, and it would show the documentation of another checkout. */

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../packages/demo/src/address.ts";
import { siteServer } from "../packages/demo/src/tooling/serve.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { port, pathname } = new URL(SITE);

/* Listening comes first: a taken port fails at once, not after the build. */
const server = siteServer(join(ROOT, "site"), pathname);
server.on("error", (error) => {
  const why = {
    EADDRINUSE: `Port ${port} is taken. Stop what is using it - another \`pnpm start\`, perhaps - and run this again.`,
    /* Windows reserves port ranges for Hyper-V and WSL. */
    EACCES: `Port ${port} may not be used here. On Windows it may lie in a reserved range: netsh int ipv4 show excludedportrange protocol=tcp`,
  }[error.code];
  console.error(why ?? error);
  process.exit(1);
});
await new Promise((listening) => server.listen(Number(port), "127.0.0.1", listening));

execFileSync(process.execPath, ["--disable-warning=ExperimentalWarning", "--experimental-strip-types", join(ROOT, "scripts", "build-site.mjs")], { cwd: ROOT, stdio: "inherit" });
console.log(`\nThe documentation is ready: ${SITE}\nStop it with Ctrl+C.`);
