/* A page: everything the demo says about one component.

   The skeleton (.scratch/demo-rework/spec.md): rubric and name, the lede, the
   import line to copy, what a user must know where there is something, the
   first example without a heading, the run of examples from simple to rich,
   the reference tables a page carries (the Language page's wording), when to
   use something else, the keyboard, what a screen reader meets, the API
   tables, and what it
   deliberately does not do. Each section appears only where it has something
   to say - a section that is always there carries no information.

   The reasoning behind a component is not here: it stands in the ADRs. What a
   user must know to use it right is the "about" under the lede. */

import { Fragment, useState, type ReactNode } from "react";
import { Example } from "./Example";
import { useContents, type ContentsEntry } from "./Contents";
import { Configurator } from "./Configurator";
import { CopyButton } from "./CopyButton";
import { Prose } from "./Prose";
import type { Demo } from "./demo";
import { hrefOf, hrefOfNeighbour } from "./href";
import { examplesOf } from "./tooling/examples";
import { apiHtml, apiSection, DEFINITIONS_ID, DEFINITIONS_TITLE } from "./tooling/apiTable";
import { referenceHtml } from "./tooling/referenceTable";
import { ADR_0032, SCENARIOS, keyboardAnchor, keysOfText } from "./outline";
import type { Rubric, Page as PageData } from "./outline";

function ImportLine({ exports, packageName }: { exports: readonly string[]; packageName: string }) {
  const text = `import { ${exports.join(", ")} } from "${packageName}";`;
  return (
    <div className="importLine">
      <code>
        {`import { ${exports.join(", ")} } from `}
        <span>{`"${packageName}";`}</span>
      </code>
      <CopyButton text={text} />
    </div>
  );
}

/** The install command on the page that installs, and on the landing - one
    line, copied whole. Every package name is a word of its own, as in the
    import line. */
export function InstallLine({ command }: { command: string }) {
  return (
    <div className="installLine">
      <code>
        {command.split(" ").map((word, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <span>{word}</span>
          </Fragment>
        ))}
      </code>
      <CopyButton text={command} />
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

/** The way on at a page's foot: the page before and the page after in the
    outline's flat order, across rubrics - the order the sidebar shows. The
    chain begins at the scenarios page (no `pageId`) and ends at the last
    page. Plain links to the pages' addresses, which the shell moves on
    without a reload. */
export function PageTurn({ demo, pageId }: { demo: Demo; pageId?: string }) {
  const { ALL_PAGES, addressOf } = demo.addresses;
  /* -1 on the scenarios page, which stands before the first page. */
  const at = ALL_PAGES.findIndex((one) => one.id === pageId);
  const previous = at === -1 ? undefined : (ALL_PAGES[at - 1] ?? { id: SCENARIOS, name: "Scenarios", rubric: undefined });
  const next = ALL_PAGES[at + 1];
  return (
    <nav className="pageTurn" aria-label="Previous and next page">
      {previous !== undefined && (
        <a href={hrefOf(addressOf(previous.id))} rel="prev">
          <span className="pageTurnLabel">
            {previous.rubric === undefined ? "Previous" : `Previous · ${previous.rubric.name}`}
          </span>
          <span className="pageTurnName">{previous.name}</span>
        </a>
      )}
      {next !== undefined && (
        <a href={hrefOf(addressOf(next.id))} rel="next">
          <span className="pageTurnLabel">{`Next · ${next.rubric.name}`}</span>
          <span className="pageTurnName">{next.name}</span>
        </a>
      )}
    </nav>
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

  /* A configurator takes the first example's slot, and the first example
     moves into the run as its first titled one, anchor and all
     (.scratch/configurator). */
  const configurator = demo.configurators.find((one) => one.pageId === page.id);
  const examples = examplesOf(demo.examples, page.id);
  const first = configurator === undefined ? examples[0] : undefined;
  const rest = configurator === undefined ? examples.slice(1) : examples;
  const api = apiSection(page, demo.addresses.ALL_PAGES, demo.tables);
  const { tables } = api;
  const known = new Set(demo.addresses.ALL_PAGES.map((one) => one.id));
  const nameOf = (id: string) => demo.addresses.ALL_PAGES.find((one) => one.id === id)?.name ?? id;

  const hasKeys = page.keys !== undefined || page.keysOf !== undefined;

  /* What stands on the page, in its order - built from the same values that
     decide below whether a section is there at all. */
  const here = hrefOf(demo.addresses.addressOf(page.id));
  const section = (id: string, label: string): ContentsEntry => ({ label, href: `${here}#${id}`, target: `#${id}` });
  const exampleEntry = ({ id, title }: { id: string; title: string }): ContentsEntry => ({
    label: title,
    href: hrefOf(demo.addresses.addressOf(page.id, id)),
    target: `[data-example="${id}"]`,
  });
  const contents = useContents([
    { label: page.name, href: here, target: `#page-${page.id}` },
    ...(first === undefined ? [] : [exampleEntry(first)]),
    ...(rest.length === 0
      ? []
      : [section(`examples-${page.id}`, "Examples"), ...rest.map((one) => ({ ...exampleEntry(one), sub: true as const }))]),
    ...(page.alternatives === undefined ? [] : [section(`alternatives-${page.id}`, "When to use something else")]),
    ...(hasKeys ? [section(keyboardAnchor(page.id), "Keyboard")] : []),
    ...(page.accessibility === undefined ? [] : [section(`accessibility-${page.id}`, "Accessibility")]),
    ...(tables.length === 0
      ? []
      : [
          section(`api-${page.id}`, "API"),
          ...tables.map((one) => ({ ...section(one.anchor, one.name), sub: true as const, code: true as const })),
          ...(api.definitions.length === 0 ? [] : [{ ...section(DEFINITIONS_ID, DEFINITIONS_TITLE), sub: true as const }]),
        ]),
    ...(page.limits === undefined ? [] : [section(`limits-${page.id}`, "Known limits")]),
  ]);

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
        {page.exports.length > 0 && <ImportLine exports={page.exports} packageName={demo.packageName} />}
        {page.installs === true && <InstallLine command={demo.install} />}
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

      {contents.disclosure}

      {configurator !== undefined ? (
        <Configurator configurator={configurator} packageName={demo.packageName} />
      ) : first === undefined ? (
        <p className="pageEmpty">
          There is no example for this page yet.
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

      {(demo.references[page.id] ?? []).map((table) => (
        <Section key={table.anchor} id={table.anchor} title={table.title}>
          {/* Written like the API section, from one model
              (`tooling/referenceTable.ts`); every row is an anchor. */}
          <div className="apiTables" dangerouslySetInnerHTML={{ __html: referenceHtml(table) }} />
        </Section>
      ))}

      {page.alternatives !== undefined && (
        <Section id={`alternatives-${page.id}`} title="When to use something else">
          <ul className="pageList">
            {page.alternatives.map(({ when, use }) => (
              <li key={when}>
                <Prose text={when} /> →{" "}
                {known.has(use) ? <a href={hrefOf(demo.addresses.addressOf(use))}>{nameOf(use)}</a> : <Prose text={use} />}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {hasKeys && (
        <Section id={keyboardAnchor(page.id)} title="Keyboard">
          {page.keys !== undefined && (
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
          )}
          {page.keysOf !== undefined && (
            <p className="pageAbout">
              <Prose text={keysOfText(page.keysOf, demo.addresses.ALL_PAGES, hrefOfNeighbour)} />
            </p>
          )}
        </Section>
      )}

      {page.accessibility !== undefined && (
        <Section id={`accessibility-${page.id}`} title="Accessibility">
          <div className="pageAbout">
            {page.accessibility.map((text) => (
              <p key={text}>
                <Prose text={text} />
              </p>
            ))}
          </div>
        </Section>
      )}

      {tables.length > 0 && (
        <Section id={`api-${page.id}`} title="API">
          {/* Written, not drawn: the same HTML the prerendered page carries,
              from the one table model (`tooling/apiTable.ts`), "Types on this
              page" included. Its links are ordinary addresses, which the shell
              takes like any other. */}
          <div
            className="apiTables"
            dangerouslySetInnerHTML={{ __html: apiHtml(api) }}
          />
        </Section>
      )}

      {page.limits !== undefined && (
        <Section id={`limits-${page.id}`} title="Known limits">
          <ul className="pageList">
            {page.limits.map((text) => (
              <li key={text}>
                <Prose text={text} />
              </li>
            ))}
          </ul>
          <p className="pageAbout">
            <Prose text={`What umriss deliberately does not build, and why: [ADR-0032](${ADR_0032}).`} />
          </p>
        </Section>
      )}

      <PageTurn demo={demo} pageId={page.id} />

      {contents.column}
    </article>
  );
}
