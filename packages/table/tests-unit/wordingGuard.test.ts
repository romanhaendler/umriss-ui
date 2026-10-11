import { wordingGuard } from "../../demo/tests-support/wordingGuard.ts";

wordingGuard("@umriss-ui/table", import.meta.glob("../src/**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>, 4);
