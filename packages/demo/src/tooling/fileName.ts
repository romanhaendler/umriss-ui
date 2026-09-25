/* What an example file is called.

   `demo/examples/<Component>/NN-<anchor>.tsx`. The number orders the run, the
   rest of the name is the anchor, and the folder name is - lower-cased - the
   address of the page.

   The rule stands here and not twice: the demo reads the files through
   `import.meta.glob`, the screenshot suite through the file system. Those are
   two ways to the same files and must not be two opinions about what they are
   called. */

/* One spelling. Both demos renamed the directory to `examples/`
   (english-and-umriss-ui 10 and 12), so the alternation that bridged them is
   gone - this pattern is the one opinion about what an example file is called,
   and it must not grow a second reason to be lenient. */
export const EXAMPLE_PATTERN = /\/examples\/([^/]+)\/(\d+)-([^/]+)\.tsx$/;

/* A scenario: `demo/scenarios/NN-<anchor>.tsx`. No folder - the scenarios all
   stand on the one page that opens a demo. */
export const SCENARIO_PATTERN = /\/scenarios\/(\d+)-([^/]+)\.tsx$/;

export interface FileName {
  /** The page's address: the folder name, lower-cased. */
  pageId: string;
  /** The number in the file name; it orders the run and nothing else. */
  rank: number;
  /** The anchor. */
  id: string;
}

/** Splits a path, or throws - an example that is not named like one should
    be noticed at load time rather than appear as "undefined". */
export function parseFileName(path: string): FileName {
  const match = EXAMPLE_PATTERN.exec(path);
  if (match === null) {
    throw new Error(
      `\`${path}\` is not named like an example. Expected: examples/<Component>/NN-<anchor>.tsx`,
    );
  }
  const [, folder, rankText, id] = match as unknown as [string, string, string, string];
  return {
    pageId: folder.toLowerCase(),
    rank: Number(rankText),
    id,
  };
}

/** A scenario's number and anchor, or throws. */
export function parseScenarioName(path: string): { rank: number; id: string } {
  const match = SCENARIO_PATTERN.exec(path);
  if (match === null) {
    throw new Error(`\`${path}\` is not named like a scenario. Expected: scenarios/NN-<anchor>.tsx`);
  }
  return { rank: Number(match[1]), id: match[2]! };
}

/** The order of a run: by number, and by anchor on a tie.

    Two runs yield the same order, however the file system reads. */
export function byRank(a: { rank: number; id: string }, b: { rank: number; id: string }): number {
  return a.rank - b.rank || a.id.localeCompare(b.id);
}
