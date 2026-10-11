import { wordingGuard } from "../../demo/tests-support/wordingGuard.ts";

wordingGuard("@umriss-ui/calculation", import.meta.glob("../src/**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>, 1);
