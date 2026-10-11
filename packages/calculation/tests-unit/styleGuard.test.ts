import { styleGuard } from "../../demo/tests-support/styleGuard.ts";

styleGuard("@umriss-ui/calculation", import.meta.glob("../src/**/*.module.css", { query: "?raw", import: "default", eager: true }) as Record<string, string>, 0);
