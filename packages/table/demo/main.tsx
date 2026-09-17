import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-mono/400.css";
/* Fetch the token and base layer explicitly - the way an application does, and
   for the same reason the head of `packages/core/demo/main.tsx` gives: without
   this line the bundler does not take the two stylesheets along, every
   `var(--u-...)` is invalid, and the demo stands there unstyled. */
import "@umriss-ui/core/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider } from "@umriss-ui/core";
import { App } from "./App";
import "@umriss-ui/demo/shell.css";
import "@umriss-ui/demo/page.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
