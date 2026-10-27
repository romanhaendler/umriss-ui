import { glyphGuard } from "../../demo/tests-support/glyphGuard.ts";

glyphGuard("@umriss-ui/alarms", import.meta.glob("../src/**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>);
