import { createRoot } from "react-dom/client";
import { TanStack } from "./tanstack";
const lib = location.hash.slice(1).split("?")[0] || "tanstack";
const map: Record<string, () => Promise<any>> = {
  tanstack: async () => TanStack,
  rhf: async () => (await import("./rhf")).RHF,
  formik: async () => (await import("./formik")).FormikPage,
  conform: async () => (await import("./conform")).ConformPage,
};
map[lib]().then((C) => createRoot(document.getElementById("root")!).render(<C />));
