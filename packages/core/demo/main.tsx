import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-mono/400.css";
/* Fetch the token and base layer explicitly.

   It does stand at the head of `src/index.ts`, but the demo build never took
   it along: `package.json` declares only CSS files side-effectful, so Rollup
   is allowed to cut away the body of the barrel when only `ToastProvider` is
   used out of it - and with the body, those two imports. The consequence: the
   demo ran without its `:root` tokens, every `var(--u-...)` was invalid, and
   the screenshots showed an unstyled page (light and dark byte-identical).

   An application that uses the package fetches `@umriss-ui/core/styles.css`
   itself as well. The demo now does the same. */
import "../src/styles/tokens.css";
import "../src/styles/global.css";
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
