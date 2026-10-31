import { useRef, useState } from "react";
import { useTable } from "../../../src";

export const title = "Folders that load on opening";
export const lead = "`childRows` answers `null` for a folder not loaded yet: it gets a fold, and opening it calls `onBranchOpen`. The promise it returns puts a loading line under the folder; a rejection shows its message there with Try again.";

interface Entry {
  id: string;
  name: string;
  size: number;
  /** `null`: a folder whose entries are not loaded; absent: a file. */
  entries?: Entry[] | null;
}

const FOLDERS: Record<string, Entry[]> = {
  reports: [
    { id: "reports-q1", name: "Q1.pdf", size: 420 },
    { id: "reports-q2", name: "Q2.pdf", size: 388 },
    { id: "reports-archive", name: "Archive", size: 0, entries: null },
  ],
  "reports-archive": [{ id: "archive-2019", name: "2019.zip", size: 9_800 }],
  photos: [
    { id: "photos-a", name: "Harbour.jpg", size: 3_100 },
    { id: "photos-b", name: "Market.jpg", size: 2_700 },
  ],
  backups: [],
};

const ROOTS: Entry[] = [
  { id: "reports", name: "Reports", size: 0, entries: null },
  { id: "photos", name: "Photos", size: 0, entries: null },
  { id: "backups", name: "Backups (offline)", size: 0, entries: null },
  { id: "readme", name: "README.txt", size: 2 },
];

/** Puts the loaded entries under the folder with this key. */
const fill = (list: Entry[], key: string, entries: Entry[]): Entry[] =>
  list.map((e) => (e.id === key ? { ...e, entries } : e.entries ? { ...e, entries: fill(e.entries, key, entries) } : e));

export default function FoldersThatLoadOnOpening() {
  const [tree, setTree] = useState(ROOTS);
  const tried = useRef(0);
  const { Table, Column } = useTable(tree, {
    rowKey: (e) => e.id,
    childRows: (e) => e.entries,
    onBranchOpen: (key) =>
      new Promise<void>((resolve, reject) =>
        setTimeout(() => {
          /* The offline folder fails the first time and answers the second. */
          if (key === "backups" && tried.current++ === 0) return reject(new Error("The share is offline."));
          setTree((old) => fill(old, key, FOLDERS[key] ?? []));
          resolve();
        }, 500),
      ),
  });
  return (
    <Table aria-label="Files">
      <Column value="name" label="Name" rowHeader />
      <Column value="size" label="Size (KB)" />
    </Table>
  );
}
