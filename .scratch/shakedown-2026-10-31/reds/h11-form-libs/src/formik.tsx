import { Formik, Form, useField, useFormikContext } from "formik";
import { Button } from "@umriss-ui/core";
import { NAMES, Row, defaults, schema, log, type Name } from "./shared";

const glue = location.hash.includes("glue");
function FRow({ n }: { n: Name }) {
  const [field, meta, helpers] = useField<any>(n);
  const { isSubmitting } = useFormikContext();
  return (
    <Row n={n} b={{
      value: field.value, name: ["city","tags","date","range","when"].includes(n) ? undefined : field.name, disabled: isSubmitting,
      onChange: (v) => helpers.setValue(v),
      onBlur: glue ? () => helpers.setTouched(true) : field.onBlur,
      error: meta.touched && meta.error ? meta.error : undefined,
    }} />
  );
}
function Touched() { const { touched } = useFormikContext(); return <i id="touched">{Object.keys(touched).join(",")}</i>; }
export function FormikPage() {
  return (
    <Formik initialValues={defaults}
      validate={(values) => { const r = schema.safeParse(values); const e: any = {}; if (!r.success) for (const i of r.error.issues) e[i.path[0] as string] ??= i.message; return e; }}
      onSubmit={async (v) => { await new Promise((r) => setTimeout(r, 400)); (window as any).__submitted = v; }}>
      {({ isSubmitting, resetForm, errors, submitCount }) => (
        <Form noValidate style={{ display: "grid", gap: 12, maxWidth: 520, padding: 16 }}>
          {NAMES.map((n) => <FRow key={n} n={n} />)}
          <Button type="submit" disabled={isSubmitting}>Submit</Button>
          <Button type="button" onClick={() => resetForm()}>Reset</Button>
          <Touched />
        </Form>
      )}
    </Formik>
  );
}
