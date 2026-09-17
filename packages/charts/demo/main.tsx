import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-mono/400.css";
/* Fetch the token and base layer explicitly - the way an application does. The
   order of the stylesheets is part of the appearance (docs/testing.md): the
   tokens first, then the shell, then what belongs to this demo alone. The
   charts' own stylesheet comes with `src/index.ts`. */
import "@umriss-ui/core/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@umriss-ui/demo/shell.css";
import "@umriss-ui/demo/page.css";
import "./demo.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
