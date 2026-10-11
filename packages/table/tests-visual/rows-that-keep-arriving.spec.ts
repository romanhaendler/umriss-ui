/* What jsdom cannot show of a table under rows that change every second
   (table-rows-that-keep-arriving 01): the real scroll position and the focus
   under the row motion. The jsdom half stands in
   `tests-unit/rowsThatKeepArriving.test.tsx`.

   These cases need an example whose rows tick on a clock. None exists - the
   spec adds no API and no page - so they are `fixme` until a live example is
   written; nothing here has been run. */

import { test } from "@playwright/test";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test.fixme("a scrolled plain table keeps its scrollTop when rows tick, also when one is added or removed above the window", async () => {});

test.fixme("a scrolled virtual table keeps its scrollTop and its window when rows arrive as a new array each second", async () => {});

test.fixme("a focused cell keeps the real focus when a re-sort moves its row, with the row motion running", async () => {});

test.fixme("a typed Row draft keeps its caret and its text across a tick", async () => {});
