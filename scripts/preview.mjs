/* `preview:demo` of a package: vite preview on the package's port
   (UMRISS_PORT_BASE plus its offset), answering with this checkout's path so a
   suite of another checkout does not reuse it. Run from the package folder:
   node ../../scripts/preview.mjs <package>. */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHECKOUT_HEADER, portOf } from "./ports.ts";

/* vite is the package's dependency, not the workspace root's: resolved from the folder this runs in. */
const { preview } = await import(pathToFileURL(createRequire(`${process.cwd()}/`).resolve("vite")).href);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const server = await preview({
  configFile: "vite.demo.config.ts",
  preview: { port: portOf(process.argv[2]), strictPort: true },
  plugins: [
    {
      name: "umriss-checkout-marker",
      configurePreviewServer(s) {
        s.middlewares.use((_req, res, next) => {
          res.setHeader(CHECKOUT_HEADER, root);
          next();
        });
      },
    },
  ],
});
server.printUrls();
