import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-mono/400.css";
/* Fetch the token layer explicitly - the way an application does, and for the
   reason the head of `packages/core/demo/main.tsx` gives. The calculation's own
   stylesheet comes with `src/index.ts`. */
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
