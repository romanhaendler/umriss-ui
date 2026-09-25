// The workspace's root ESLint configuration.
// Its most important rules are the directions between the packages:
// @umriss-ui/charts imports nothing from @umriss-ui/core (acceptance point 3 of
// the charts handoff) - in `src/`, which is what is published (ADR-0020); its
// demo runs in the shared shell and may - the table depends on
// @umriss-ui/core, never the other way round (ADR-0016), and the schedule on
// @umriss-ui/core and @umriss-ui/charts, and nothing on it (ADR-0022); the
// calculation on @umriss-ui/core only, and nothing on it.
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

/* Every package is checked. packages/core only joined with umriss-ui_12; the
   react-hooks rules are particularly valuable there, because the pickers steer
   effect and focus order by hand (HANDOFF A.5 §2). */
const PACKAGES = [
  "packages/charts/**/*.{ts,tsx}",
  "packages/core/**/*.{ts,tsx}",
  "packages/table/**/*.{ts,tsx}",
  "packages/schedule/**/*.{ts,tsx}",
  "packages/calculation/**/*.{ts,tsx}",
  "packages/demo/**/*.{ts,tsx}",
];

/* The demos' shell is tooling for the demos and never part of a package:
   nobody fetches it from `src/` (table-demo, decision A). */
const NO_SHELL = {
  group: ["@umriss-ui/demo", "@umriss-ui/demo/*"],
  message: "@umriss-ui/demo belongs to the demos and their tests, never to a package's source.",
};

/* Nobody imports the table: it sits on top. */
const NO_TABLE = {
  group: ["@umriss-ui/table", "@umriss-ui/table/*"],
  message: "@umriss-ui/table depends on @umriss-ui/core, not the other way round (ADR-0016).",
};

/* Nobody imports the schedule either: it sits on core and charts. */
const NO_SCHEDULE = {
  group: ["@umriss-ui/schedule", "@umriss-ui/schedule/*"],
  message: "@umriss-ui/schedule depends on @umriss-ui/core and @umriss-ui/charts, not the other way round (ADR-0022).",
};

/* Nor the calculation: it sits on core alone. */
const NO_CALCULATION = {
  group: ["@umriss-ui/calculation", "@umriss-ui/calculation/*"],
  message: "@umriss-ui/calculation depends on @umriss-ui/core, not the other way round.",
};

export default [
  {
    ignores: [
      "**/dist/**",
      "**/dist-demo/**",
      "**/node_modules/**",
      "**/tests-visual/**-snapshots/**",
    ],
  },
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: PACKAGES })),
  {
    files: PACKAGES,
    plugins: { "react-hooks": reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  {
    /* R-1.2 binds the SOURCE, because the source is what is published
       (ADR-0020). The demo and the browser suites are neither packed nor
       installed; they run in the shared shell, which takes @umriss-ui/core. */
    files: ["packages/charts/src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@umriss-ui/core", "@umriss-ui/core/*"],
              message:
                "@umriss-ui/charts is standalone: no import from @umriss-ui/core (R-1.2).",
            },
            NO_TABLE,
            NO_SCHEDULE,
            NO_CALCULATION,
          ],
        },
      ],
    },
  },
  {
    /* Nobody imports the table or the schedule, the demo included. */
    files: ["packages/charts/**/*.{ts,tsx}"],
    ignores: ["packages/charts/src/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [NO_TABLE, NO_SCHEDULE, NO_CALCULATION] }],
    },
  },
  {
    /* The core demo's scenarios import every package, as a consumer would
       (control-room-demo, R1): the rule binds what is published and what
       tests it, not the composed screens. */
    files: ["packages/core/**/*.{ts,tsx}"],
    ignores: ["packages/core/demo/scenarios/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [NO_TABLE, NO_SCHEDULE, NO_CALCULATION] }],
    },
  },
  {
    /* The table takes @umriss-ui/core through the public entry only - no
       subpath, no relative route into the neighbouring package. What it needs
       from inside becomes public there (ADR-0016). The stylesheet and the German
       wording (`wording/de`, ADR-0019) are the two declared exports beside the
       entry. Charts stays standalone. */
    files: ["packages/table/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              /* The exceptions stand behind the barrier, and `wording` has to be
                 taken back as a directory first: under gitignore rules a file
                 beneath an excluded directory cannot otherwise be re-included. */
              group: [
                "@umriss-ui/core/*",
                "!@umriss-ui/core/styles.css",
                "!@umriss-ui/core/wording",
                "!@umriss-ui/core/wording/de",
              ],
              message: "@umriss-ui/table imports only the public entry of @umriss-ui/core (ADR-0016).",
            },
            {
              group: ["**/core/src/**", "**/packages/core/**", "../../core/**", "../core/**"],
              message: "@umriss-ui/table does not reach into @umriss-ui/core by path (ADR-0016).",
            },
            {
              group: ["@umriss-ui/charts", "@umriss-ui/charts/*"],
              message: "@umriss-ui/table depends on @umriss-ui/core only (ADR-0016).",
            },
            NO_SCHEDULE,
            NO_CALCULATION,
          ],
        },
      ],
    },
  },
  {
    /* The schedule takes both peers through their public entries only - no
       subpath beyond the declared exports, no relative route into a
       neighbouring package (ADR-0022). */
    files: ["packages/schedule/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@umriss-ui/core/*",
                "!@umriss-ui/core/styles.css",
                "!@umriss-ui/core/wording",
                "!@umriss-ui/core/wording/de",
              ],
              message: "@umriss-ui/schedule imports only the public entry of @umriss-ui/core (ADR-0022).",
            },
            {
              group: ["@umriss-ui/charts/*", "!@umriss-ui/charts/styles.css"],
              message: "@umriss-ui/schedule imports only the public entry of @umriss-ui/charts (ADR-0022).",
            },
            {
              group: ["**/core/src/**", "**/charts/src/**", "**/packages/core/**", "**/packages/charts/**", "../../core/**", "../core/**", "../../charts/**", "../charts/**"],
              message: "@umriss-ui/schedule does not reach into a neighbouring package by path (ADR-0022).",
            },
            NO_TABLE,
            NO_CALCULATION,
          ],
        },
      ],
    },
  },
  {
    /* The calculation takes @umriss-ui/core through its public entry only, as
       the table does (ADR-0016), and no other package. */
    files: ["packages/calculation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@umriss-ui/core/*",
                "!@umriss-ui/core/styles.css",
                "!@umriss-ui/core/wording",
                "!@umriss-ui/core/wording/de",
              ],
              message: "@umriss-ui/calculation imports only the public entry of @umriss-ui/core.",
            },
            {
              group: ["**/core/src/**", "**/packages/core/**", "../../core/**", "../core/**"],
              message: "@umriss-ui/calculation does not reach into @umriss-ui/core by path.",
            },
            {
              group: ["@umriss-ui/charts", "@umriss-ui/charts/*"],
              message: "@umriss-ui/calculation depends on @umriss-ui/core only.",
            },
            NO_TABLE,
            NO_SCHEDULE,
          ],
        },
      ],
    },
  },
  {
    /* A rule of its own rather than `no-restricted-imports`: a later
       configuration of the same rule replaced the packages' patterns above
       instead of adding to them. */
    files: ["packages/*/src/**/*.{ts,tsx}"],
    ignores: ["packages/demo/src/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": ["error", { patterns: [NO_SHELL] }],
    },
  },
  {
    /* The shell takes the public entry and the stylesheet from @umriss-ui/core,
       and no other package. */
    files: ["packages/demo/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@umriss-ui/core/*", "!@umriss-ui/core/styles.css"],
              message: "@umriss-ui/demo imports only the public entry of @umriss-ui/core.",
            },
            {
              group: ["**/core/src/**", "**/packages/core/**", "**/packages/table/**", "../../core/**", "../core/**", "../../table/**", "../table/**"],
              message: "@umriss-ui/demo does not reach into a package by path; a demo gives it what it needs.",
            },
            NO_TABLE,
            NO_SCHEDULE,
            NO_CALCULATION,
          ],
        },
      ],
    },
  },
  {
    /* A world is copied beside an example and must compile there: plain
       data, no import of anything. */
    files: ["packages/demo/src/worlds/*.ts"],
    rules: {
      "no-restricted-syntax": ["error", { selector: "ImportDeclaration", message: "A world imports nothing - declare the shapes it needs locally." }],
    },
  },
];
