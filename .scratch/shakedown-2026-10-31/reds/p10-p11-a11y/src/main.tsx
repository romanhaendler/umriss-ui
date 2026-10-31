import { createRoot } from "react-dom/client";
import { UmrissProvider } from "@umriss-ui/core";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { Screens } from "./screens";

const q = new URLSearchParams(location.search);
const de = q.get("lang") === "de";
document.documentElement.lang = de ? "de" : "en";
document.documentElement.style.colorScheme = q.get("theme") === "dark" ? "dark" : "light";
document.body.style.margin = "16px";
document.body.style.background = "var(--u-color-bg)";
const LANG = { formats: GERMAN_FORMATS, wording: GERMAN_WORDING };
createRoot(document.getElementById("root")!).render(
  de ? <UmrissProvider language={LANG}><Screens /></UmrissProvider> : <UmrissProvider><Screens /></UmrissProvider>,
);
