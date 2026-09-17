import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-mono/400.css";
/* Fetch the tokens explicitly.

   They do stand at the head of `src/index.ts`, but the demo reads the sources,
   and its build never took them along: `package.json` declares only CSS files
   side-effectful, so Rollup is allowed to cut away the body of the barrel when
   only `ToastProvider` is used out of it - and with the body, that import. The
   consequence once: the demo ran without its `:root` tokens and the screenshots
   showed an unstyled page. A caller of the built package needs no such line -
   `dist/core.js` imports its stylesheet itself (ADR-0021).

   There is no base layer to fetch any more: the page around the examples gets
   nothing from the library, which is what the screenshots prove. */
import "../src/styles/tokens.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider } from "../src";
import { App } from "./App";
/* The shell's styles explicitly and last, as before their move to
   @umriss-ui/demo: the order of the stylesheets is part of the appearance. */
import "@umriss-ui/demo/shell.css";
import "@umriss-ui/demo/page.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
