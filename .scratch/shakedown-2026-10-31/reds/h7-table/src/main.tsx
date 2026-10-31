import { useState } from "react";
import { createRoot } from "react-dom/client";
import { UmrissProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { SCENES } from "./scenes";

const q = new URLSearchParams(location.search);
document.documentElement.style.colorScheme = q.get("dark") ? "dark" : "light";
const DE = { formats: GERMAN_FORMATS, wording: GERMAN_WORDING };
const Scene = SCENES[q.get("s") ?? "live"]!;
function App() {
  const [de, setDe] = useState(q.get("lang") === "de");
  (window as any).__setLang = (v: boolean) => setDe(v);
  return <UmrissProvider language={de ? DE : undefined}><Scene /></UmrissProvider>;
}
createRoot(document.getElementById("root")!).render(<App />);
