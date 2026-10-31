import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@umriss-ui/core/styles.css";
import "@umriss-ui/table/styles.css";
import { App } from "./App";
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
