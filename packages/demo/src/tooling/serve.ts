/* A static server for the built site, `site/`, under the path it is built for
   (`/umriss-ui/`): what `pnpm start` serves. A directory page is found by its
   `index.html`, a directory asked for without its slash is forwarded to it
   (the page's relative addresses need it), a Markdown twin is a file, and an
   address that is no file is a 404 with the site's own 404 page - the site
   the guard over the build holds whole.

   Node only; imports nothing but Node's own modules. */

import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFileSync, statSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";

const TYPES: Readonly<Record<string, string>> = {
  ".html": "text/html; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".json": "application/json",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

/** `dir` served under `base` (`/umriss-ui/`, with both slashes). `/` forwards
    to the base: the front page is the site's first page. */
export function siteServer(dir: string, base: string): Server {
  const root = resolve(dir);
  const fileAt = (path: string) => statSync(path, { throwIfNoEntry: false });
  const answer = (request: IncomingMessage, response: ServerResponse) => {
    const notFound = () => {
      const page = fileAt(join(root, "404.html"))?.isFile() ? readFileSync(join(root, "404.html")) : "Not found";
      response.writeHead(404, { "content-type": TYPES[".html"] }).end(page);
    };
    const raw = new URL(request.url ?? "/", "http://localhost").pathname;
    let path: string;
    try {
      path = decodeURIComponent(raw);
    } catch {
      return notFound();
    }
    if (path === "/") {
      response.writeHead(302, { location: base }).end();
      return;
    }
    if (path === base.slice(0, -1)) {
      response.writeHead(301, { location: base }).end();
      return;
    }
    if (!path.startsWith(base)) return notFound();
    let file = resolve(root, path.slice(base.length));
    if (file !== root && !file.startsWith(root + sep)) return notFound();
    if (fileAt(file)?.isDirectory()) {
      if (!path.endsWith("/")) {
        response.writeHead(301, { location: `${raw}/` }).end();
        return;
      }
      file = join(file, "index.html");
    }
    if (!fileAt(file)?.isFile()) return notFound();
    response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
  };
  /* A request that makes the handler throw (a path `statSync` refuses) is a 400,
     never the end of the process. */
  return createServer((request, response) => {
    try {
      answer(request, response);
    } catch {
      if (!response.headersSent) response.writeHead(400);
      response.end();
    }
  });
}
