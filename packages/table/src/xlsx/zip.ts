/* A ZIP of named UTF-8 parts, stored without compression: the container an
   XLSX file needs and nothing of ZIP beyond that (no ZIP64, no extra fields). */

const TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) c = TABLE[(c ^ b) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/* 1980-01-01 00:00:00: the file is the same bytes whenever it is written. */
const DOS_DATE = 0x21;
const UTF8_FLAG = 0x0800;

/** The parts, in the given order, as one stored ZIP. Throws a `RangeError`
    beyond what the format without ZIP64 holds: 65,535 parts or 4 GB. */
export function zip(parts: readonly { name: string; text: string }[]): Uint8Array {
  if (parts.length > 0xffff) throw new RangeError("A ZIP holds at most 65,535 parts.");
  const enc = new TextEncoder();
  const files = parts.map((p) => ({ name: enc.encode(p.name), data: enc.encode(p.text) }));
  let size = 22;
  for (const f of files) size += 30 + 46 + 2 * f.name.length + f.data.length;
  if (size > 0xffffffff) throw new RangeError("A ZIP without ZIP64 holds at most 4 GB.");

  const out = new Uint8Array(size);
  const view = new DataView(out.buffer);
  let at = 0;
  const u16 = (v: number) => {
    view.setUint16(at, v, true);
    at += 2;
  };
  const u32 = (v: number) => {
    view.setUint32(at, v, true);
    at += 4;
  };
  const bytes = (b: Uint8Array) => {
    out.set(b, at);
    at += b.length;
  };

  const offsets: number[] = [];
  const crcs = files.map((f) => crc32(f.data));
  files.forEach((f, i) => {
    offsets.push(at);
    u32(0x04034b50);
    u16(20);
    u16(UTF8_FLAG);
    u16(0);
    u16(0);
    u16(DOS_DATE);
    u32(crcs[i]!);
    u32(f.data.length);
    u32(f.data.length);
    u16(f.name.length);
    u16(0);
    bytes(f.name);
    bytes(f.data);
  });
  const directory = at;
  files.forEach((f, i) => {
    u32(0x02014b50);
    u16(20);
    u16(20);
    u16(UTF8_FLAG);
    u16(0);
    u16(0);
    u16(DOS_DATE);
    u32(crcs[i]!);
    u32(f.data.length);
    u32(f.data.length);
    u16(f.name.length);
    u16(0);
    u16(0);
    u16(0);
    u16(0);
    u32(0);
    u32(offsets[i]!);
    bytes(f.name);
  });
  const end = at;
  u32(0x06054b50);
  u16(0);
  u16(0);
  u16(files.length);
  u16(files.length);
  u32(end - directory);
  u32(directory);
  u16(0);
  return out;
}
