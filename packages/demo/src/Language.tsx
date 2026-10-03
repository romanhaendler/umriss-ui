/* The language of the components: EN or DE, one choice for the four demos
   whose components read core's language (.scratch/language-switch).

   DE renders every example stage and every scenario stage inside the
   library's `LanguageProvider` with the German pair - the line an application
   writes once at its root (ADR-0024), handed over by the demo, which alone
   knows whether its components read core's language. Nothing else changes:
   the page's prose, its tables and code, the palette and the shell's own words
   are documentation and frame, and stay English (ADR-0018). The address
   carries no language either: German is a view of the same page (ADR-0037).

   An example that sets its own provider keeps the languages its code names -
   the Language page's side-by-side example would otherwise show German twice.
   The source is the example, so the source decides.

   The choice is stored under `umriss-ui:language`, the scheme the theme set
   (`ThemeSwitch.tsx`), and read once at start; nothing stored, or storage
   that throws, means English, and the switch still works for the visit. No
   script before the first paint: the prerendered text is English anyway. */

import { createContext, useContext, useState, type ComponentProps } from "react";
import { LanguageProvider, type Formats, type Wording } from "@umriss-ui/core";
import { hrefOfNeighbour } from "./href";
import { Prose } from "./Prose";

/** The German pair, as `@umriss-ui/core/wording/de` exports it. */
export interface German {
  wording: Wording;
  formats: Formats;
}

type Language = "en" | "de";

const KEY = "umriss-ui:language";

function storedLanguage(): Language {
  try {
    return window.localStorage.getItem(KEY) === "de" ? "de" : "en";
  } catch {
    return "en";
  }
}

/** The reader's choice, remembered. */
export function useLanguage(): [Language, (next: Language) => void] {
  const [language, setLanguage] = useState(storedLanguage);
  const choose = (next: Language) => {
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* Blocked: the choice lasts for the visit. */
    }
    setLanguage(next);
  };
  return [language, choose];
}

/** The German pair while DE is chosen, nothing while EN is. */
export const ShownGerman = createContext<German | undefined>(undefined);

/** The header's two buttons. Plain elements, as the rest of the frame. */
export function LanguageSwitch({ language, onChoose }: { language: Language; onChoose: (next: Language) => void }) {
  return (
    <div className="shellLanguage" role="group" aria-label="Language of the components">
      <button type="button" aria-label="English" aria-pressed={language === "en"} onClick={() => onChoose("en")}>
        EN
      </button>
      <button type="button" aria-label="Deutsch" lang="de" aria-pressed={language === "de"} onClick={() => onChoose("de")}>
        DE
      </button>
    </div>
  );
}

/** The stage an example, a configurator or a scenario stands on. The
    provider stands there under English too, with nothing passed: switching
    then changes a value and not the tree, and an example keeps its state. */
export function Stage({ ownLanguage = false, children, ...div }: ComponentProps<"div"> & { ownLanguage?: boolean }) {
  const shown = useContext(ShownGerman);
  const german = ownLanguage ? undefined : shown;
  return (
    <div {...div} lang={german === undefined ? undefined : "de"}>
      <LanguageProvider wording={german?.wording} formats={german?.formats}>
        {children}
      </LanguageProvider>
    </div>
  );
}

/** The one line at the top of a page while DE is chosen. */
export function GermanNotice({ packageName }: { packageName: string }) {
  if (useContext(ShownGerman) === undefined) return null;
  const language = packageName === "@umriss-ui/core" ? "#/language" : hrefOfNeighbour("@umriss-ui/core", "language");
  return (
    <p className="languageNotice">
      <Prose
        text={`The examples render in German: \`GERMAN_WORDING\` and \`GERMAN_FORMATS\` at the root, as on [Language](${language}). The code shown is unchanged.`}
      />
    </p>
  );
}
