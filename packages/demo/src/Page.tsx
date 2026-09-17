/* A page: everything the demo says about one component.

   The structure is the one a reader of a component library knows: rubric and
   name, one sentence of what for, the import line to copy, the run of
   examples, the API tables, and - only where there is one - "Why it is like this".

   The tables stand BEFORE the prose. Whoever opens the page to look something
   up came for the table.

   There is no separate section for accessibility, although other libraries
   have one. Here it is not an appendix but the reason for half the
   construction - and it belongs where that reason stands: under "Why it is like this",
   beside everything else that was a decision. */

import { useState } from "react";
import { Example } from "./Example";
import { CopyButton } from "./CopyButton";
import { PropsTable } from "./PropsTable";
import type { Demo } from "./demo";
import { examplesOf } from "./tooling/examples";
import { tablesOf } from "./tooling/tables";
import type { Rubric, Page as PageData } from "./outline";

function ImportLine({ exports, packageName }: { exports: readonly string[]; packageName: string }) {
  const text = `import { ${exports.join(", ")} } from "${packageName}";`;
  return (
    <div className="importLine">
      <code>{text}</code>
      <CopyButton text={text} />
    </div>
  );
}

export interface PageProps {
  /** The demo the page belongs to. */
  demo: Demo;
  page: PageData & { rubric: Rubric };
}

export function Page({ demo, page }: PageProps) {
  /* The toggle belongs to the page and not to the example: it is the
     statement for every block at once. It keeps its state as long as the
     reader is on the page, and starts closed again on the next one - that
     needs no effect, the shell gives the page its id as the `key`. */
  const [allOpen, setAllOpen] = useState(false);

  const examples = examplesOf(demo.examples, page.id);
  const tables = tablesOf(demo.tables, page.types);
  const why = demo.why.get(page.id);

  return (
    <article className="page" data-block={page.id} aria-labelledby={`page-${page.id}`}>
      <header className="pageHead">
        <p className="pageRubric">{page.rubric.name}</p>
        <h1 className="pageName" id={`page-${page.id}`}>
          {page.name}
        </h1>
        <p className="pageSentence">{page.sentence}</p>
        <ImportLine exports={page.exports} packageName={demo.packageName} />
      </header>

      <section className="section" aria-labelledby={`examples-${page.id}`}>
        <div className="sectionHead">
          <h2 className="sectionTitle" id={`examples-${page.id}`}>
            Examples
          </h2>
          {examples.length > 0 && (
            <label className="codeToggle">
              <input
                type="checkbox"
                checked={allOpen}
                onChange={(event) => setAllOpen(event.target.checked)}
              />
              all examples with code
            </label>
          )}
        </div>
        {examples.length === 0 ? (
          <p className="pageEmpty">
            There is no example for this page yet. The table below is complete all the
            same – it comes from the source.
          </p>
        ) : (
          examples.map((example) => (
            <Example key={example.id} example={example} allOpen={allOpen} />
          ))
        )}
      </section>

      <section className="section" aria-labelledby={`api-${page.id}`}>
        <div className="sectionHead">
          <h2 className="sectionTitle" id={`api-${page.id}`}>
            API
          </h2>
        </div>
        {tables.map((entry) => (
          <PropsTable key={entry.name} entry={entry} />
        ))}
      </section>

      {why !== undefined && (
        <section className="section" aria-labelledby={`why-${page.id}`}>
          <div className="sectionHead">
            <h2 className="sectionTitle" id={`why-${page.id}`}>
              Why it is like this
            </h2>
          </div>
          <div className="why">{why}</div>
        </section>
      )}
    </article>
  );
}
