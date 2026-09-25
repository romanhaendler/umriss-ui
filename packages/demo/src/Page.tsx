/* A page: everything the demo says about one component.

   The skeleton (.scratch/demo-rework/spec.md): rubric and name, the lede, the
   import line to copy, what a user must know where there is something, the
   first example without a heading, the run of examples from simple to rich,
   when to use something else, the keyboard, the API tables, and what it
   deliberately does not do. Each section appears only where it has something
   to say - a section that is always there carries no information.

   The reasoning behind a component is not here: it stands in the ADRs. What a
   user must know to use it right is the "about" under the lede. */

import { useState, type ReactNode } from "react";
import { Example } from "./Example";
import { CopyButton } from "./CopyButton";
import { PropsTable } from "./PropsTable";
import { Prose } from "./Prose";
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

function Section({ id, title, children, extra }: { id: string; title: string; children: ReactNode; extra?: ReactNode }) {
  return (
    <section className="section" aria-labelledby={id}>
      <div className="sectionHead">
        <h2 className="sectionTitle" id={id}>
          {title}
        </h2>
        {extra}
      </div>
      {children}
    </section>
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

  const [first, ...rest] = examplesOf(demo.examples, page.id);
  const tables = tablesOf(demo.tables, page.types);
  const known = new Set(demo.addresses.ALL_PAGES.map((one) => one.id));
  const nameOf = (id: string) => demo.addresses.ALL_PAGES.find((one) => one.id === id)?.name ?? id;

  return (
    <article className="page" data-block={page.id} aria-labelledby={`page-${page.id}`}>
      <header className="pageHead">
        <p className="pageRubric">{page.rubric.name}</p>
        <h1 className="pageName" id={`page-${page.id}`}>
          {page.name}
        </h1>
        <p className="pageSentence">
          <Prose text={page.sentence} />
        </p>
        <ImportLine exports={page.exports} packageName={demo.packageName} />
        {page.about !== undefined && (
          <div className="pageAbout">
            {page.about.map((text) => (
              <p key={text}>
                <Prose text={text} />
              </p>
            ))}
          </div>
        )}
      </header>

      {first === undefined ? (
        <p className="pageEmpty">
          There is no example for this page yet. The table below is complete all the same – it
          comes from the source.
        </p>
      ) : (
        <Example example={first} allOpen={allOpen} hero />
      )}

      {rest.length > 0 && (
        <Section
          id={`examples-${page.id}`}
          title="Examples"
          extra={
            <label className="codeToggle">
              <input type="checkbox" checked={allOpen} onChange={(event) => setAllOpen(event.target.checked)} />
              all examples with code
            </label>
          }
        >
          {rest.map((example) => (
            <Example key={example.id} example={example} allOpen={allOpen} />
          ))}
        </Section>
      )}

      {page.alternatives !== undefined && (
        <Section id={`alternatives-${page.id}`} title="When to use something else">
          <ul className="pageList">
            {page.alternatives.map(({ when, use }) => (
              <li key={when}>
                <Prose text={when} /> →{" "}
                {known.has(use) ? <a href={`#/${use}`}>{nameOf(use)}</a> : <Prose text={use} />}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {page.keys !== undefined && (
        <Section id={`keyboard-${page.id}`} title="Keyboard">
          <table className="keyTable">
            <thead>
              <tr>
                <th scope="col">Key</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {page.keys.map(({ key, action }) => (
                <tr key={key}>
                  <th scope="row">
                    <kbd>{key}</kbd>
                  </th>
                  <td>
                    <Prose text={action} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      <Section id={`api-${page.id}`} title="API">
        {tables.map((entry) => (
          <PropsTable key={entry.name} entry={entry} eventsApart={demo.eventsApart} />
        ))}
      </Section>

      {page.limits !== undefined && (
        <Section id={`limits-${page.id}`} title="Known limits">
          <ul className="pageList">
            {page.limits.map((text) => (
              <li key={text}>
                <Prose text={text} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}
