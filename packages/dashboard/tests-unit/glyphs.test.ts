import { glyphGuard } from "../../demo/tests-support/glyphGuard.ts";

glyphGuard("@umriss-ui/dashboard", import.meta.glob("../src/**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>);
