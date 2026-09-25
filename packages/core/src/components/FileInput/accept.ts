/* The `accept` attribute read as the HTML standard reads it - the picker
   applies it, and a drop does not pass the picker. A comma-separated list of
   tokens: `.ext` matches the end of the name regardless of case, `type/*` a
   MIME type's family, anything else one MIME type. No rule takes everything. */

export function accepts(file: File, accept: string | undefined): boolean {
  const tokens = (accept ?? "")
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) =>
    token.startsWith(".")
      ? name.endsWith(token)
      : token.endsWith("/*")
        ? type.startsWith(token.slice(0, -1))
        : type === token,
  );
}
