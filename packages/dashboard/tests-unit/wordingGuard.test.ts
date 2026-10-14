import { wordingGuard } from "../../demo/tests-support/wordingGuard.ts";

wordingGuard("@umriss-ui/dashboard", import.meta.glob("../src/**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>, 0);
