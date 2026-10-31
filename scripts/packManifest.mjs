/* The manifest as it is packed: without `scripts`. Every script of a package is
   for working in this repository (`props`, `dev`, `check:dist` need the demo and
   the workspace), and none of them runs when the package is installed.
   `prepack` calls `strip` and `postpack` `restore`, from the package's directory;
   the manifest is kept beside itself as `package.json.packed-backup` between the two. */

import { copyFileSync, readFileSync, renameSync, writeFileSync } from "node:fs";

const backup = "package.json.packed-backup";
const [action] = process.argv.slice(2);

if (action === "strip") {
  copyFileSync("package.json", backup);
  const manifest = JSON.parse(readFileSync("package.json", "utf8"));
  delete manifest.scripts;
  writeFileSync("package.json", `${JSON.stringify(manifest, null, 2)}\n`);
} else if (action === "restore") {
  renameSync(backup, "package.json");
} else {
  console.error("usage: packManifest.mjs strip|restore");
  process.exit(2);
}
