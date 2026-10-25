/* Module hooks of the Flight check (check-dist.ts), loaded in both of its
   processes. A stylesheet loads as nothing. On the server, a module that begins
   with "use client" loads as one client reference per export - what a bundler's
   loader does - named by the file's name; on the client it loads as it is. */

import { basename } from "node:path";
import { fileURLToPath } from "node:url";

const server = process.execArgv.join(" ").includes("react-server");

export async function load(url, context, nextLoad) {
  if (url.endsWith(".css")) return { format: "module", source: "", shortCircuit: true };
  const loaded = await nextLoad(url, context);
  if (!server || loaded.format !== "module") return loaded;
  const source = String(loaded.source);
  if (!source.startsWith(`"use client"`)) return loaded;
  const names = [
    ...[...source.matchAll(/export\s+(?:async\s+)?(?:function|const|class)\s+(\w+)/g)].map((match) => match[1]),
    ...[...source.matchAll(/export\s*\{([^}]*)\}/g)].flatMap((match) => match[1].split(",").map((part) => part.trim().split(/\s+as\s+/).pop()).filter(Boolean)),
  ];
  const id = basename(fileURLToPath(url));
  return {
    format: "module",
    shortCircuit: true,
    source:
      `import { registerClientReference } from "react-server-dom-webpack/server";\n` +
      names.map((name) => `export const ${name} = registerClientReference(() => { throw new Error("${name} is a client reference"); }, ${JSON.stringify(id)}, ${JSON.stringify(name)});`).join("\n"),
  };
}
