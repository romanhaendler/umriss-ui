/* The client half of the Flight check: React's Flight client decodes the
   payload on stdin, with the client modules as they are built, and
   `renderToString` turns the result into HTML. Prints the HTML, or exits 1
   with the error's message. */

import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { createFromNodeStream } from "react-server-dom-webpack/client";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";

const [, , calculationClient, passthrough] = process.argv;
const modules = {
  "calculation.client.js": await import(pathToFileURL(calculationClient).href),
  "passthrough.client.js": await import(pathToFileURL(passthrough).href),
};
globalThis.__webpack_require__ = (id) => modules[id];
globalThis.__webpack_chunk_load__ = () => Promise.resolve();

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const moduleMap = new Proxy({}, { get: (_, id) => new Proxy({}, { get: (__, name) => ({ id, name, chunks: [] }) }) });
try {
  const tree = await createFromNodeStream(Readable.from(chunks), { moduleMap, moduleLoading: { prefix: "" } });
  process.stdout.write(renderToString(h("div", null, tree)));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
