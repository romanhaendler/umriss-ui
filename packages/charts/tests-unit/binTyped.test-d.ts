/* `bin` takes a typed column and refuses strings. Compiled by `typecheck`; the
   `@ts-expect-error` MUST yield an error. */

import { bin } from "../src/bin";

bin(new Float64Array(2));
bin(new Int32Array(2));
// @ts-expect-error strings are not numbers
bin(["a", "b"]);
