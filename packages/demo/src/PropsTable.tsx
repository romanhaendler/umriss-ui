/* A page's props table.

   It stands BEFORE "Why it is like this": whoever opens the page to look
   something up came for the table and should not scroll past prose to reach it.

   Four columns - name, type, default, description. What React declares for the
   element being carried does not stand in it as two hundred and fifty rows but
   as one sentence underneath. */

import type { TypeEntry } from "./tooling/tables";

function Head({ entry }: { entry: TypeEntry }) {
  const parameter = entry.parameter.length === 0 ? "" : `<${entry.parameter.join(", ")}>`;
  return (
    <h3 className="apiTitle">
      <code>
        {entry.name}
        {parameter}
      </code>
    </h3>
  );
}

function InheritedSentence({ entry }: { entry: TypeEntry }) {
  if (entry.inherits === undefined) return null;
  const angled = entry.inherits.startsWith("<");
  return (
    <p className="apiInherited">
      Also takes every attribute of {angled ? <code>{entry.inherits}</code> : entry.inherits}
      {entry.omitted.length > 0 && (
        <>
          {" "}
          – without{" "}
          {entry.omitted.map((name, i) => (
            <span key={name}>
              {i > 0 && ", "}
              <code>{name}</code>
            </span>
          ))}
        </>
      )}
      .
    </p>
  );
}

/* The parts of a type that have a table of their own on the page - named
   rather than copied out again. */
function AlsoSentence({ entry }: { entry: TypeEntry }) {
  const alsoTakes = entry.alsoTakes ?? [];
  if (alsoTakes.length === 0) return null;
  return (
    <p className="apiInherited">
      Also every prop of{" "}
      {alsoTakes.map((name, i) => (
        <span key={name}>
          {i > 0 && (i === alsoTakes.length - 1 ? " and " : ", ")}
          <code>{name}</code>
        </span>
      ))}
      .
    </p>
  );
}

export function PropsTable({ entry }: { entry: TypeEntry }) {
  return (
    <div className="apiBlock" data-type={entry.name}>
      <Head entry={entry} />
      {entry.props.length === 0 ? (
        <p className="apiInherited">Declares no props of its own.</p>
      ) : (
        <div className="apiRole">
          <table className="apiTable">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Type</th>
                <th scope="col">Default</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {entry.props.map((prop) => (
                <tr key={prop.name}>
                  <th scope="row">
                    <code>{prop.name}</code>
                    {!prop.optional && (
                      <span className="apiRequired" title="Pflicht">
                        *
                      </span>
                    )}
                  </th>
                  <td>
                    <code className="apiType">{prop.type}</code>
                  </td>
                  <td>{prop.defaultValue === undefined ? "—" : <code>{prop.defaultValue}</code>}</td>
                  <td>
                    {prop.description}
                    {prop.inheritedFrom !== undefined && (
                      <span className="apiOrigin">
                        {" "}
                        aus <code>{prop.inheritedFrom}</code>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AlsoSentence entry={entry} />
      <InheritedSentence entry={entry} />
    </div>
  );
}
