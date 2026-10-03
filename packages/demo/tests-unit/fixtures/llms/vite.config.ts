/* Fixture: the library entries as a package's build names them - the API
   index reads the exports from here, the German wording as a subpath. */
export default { build: { lib: { entry: { index: "src/index.ts", "wording/de": "src/de.ts" } } } };
