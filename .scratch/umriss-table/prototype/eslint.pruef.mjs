import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

const DATEIEN = ["laufzeit/**/*.tsx"];
export default [
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: DATEIEN })),
  { files: DATEIEN, plugins: { "react-hooks": reactHooks }, rules: { ...reactHooks.configs.recommended.rules } },
];
