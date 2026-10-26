import { useEffect, useState } from "react";
import { Alert, Combobox, FormField, Stack, Text } from "../../../src";

export const title = "Search with the server";
export const lead =
  "The field reports what is typed and shows the results as given. The debounce and the cancelling of a stale request are the application's: here 250 ms of rest and an AbortController. Type “err” for a failed request.";

interface Customer {
  value: string;
  label: string;
}

const NAMES = ["Acme Logistics", "Acorn Foods", "Alder Mills", "Birch Freight", "Cobalt Marine", "Delta Tools", "Ember Works", "Fjord Energy"];
const CUSTOMERS: readonly Customer[] = NAMES.map((label, index) => ({ value: `c-${index + 1}`, label }));

/* A server that answers after 400 ms, and stops answering when it is aborted. */
function searchCustomers(text: string, signal: AbortSignal): Promise<Customer[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (text.toLowerCase().includes("err")) reject(new Error("The server did not answer."));
      else resolve(CUSTOMERS.filter((customer) => customer.label.toLowerCase().includes(text.toLowerCase())));
    }, 400);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

export default function SearchWithTheServer() {
  const [customer, setCustomer] = useState<string | null>(null);
  const [options, setOptions] = useState<readonly Customer[]>(CUSTOMERS);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [text, setText] = useState("");

  // The debounce: a request starts once the typing rests, and the stale one is aborted.
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setFailed(false);
      searchCustomers(text, controller.signal).then(
        (found) => {
          setOptions(found);
          setLoading(false);
        },
        (error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setOptions([]);
          setFailed(true);
          setLoading(false);
        },
      );
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  return (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <FormField label="Customer">
        <Combobox
          value={customer}
          onChange={setCustomer}
          options={options}
          filter={false}
          loading={loading}
          onSearch={setText}
          clearable
          placeholder="Search customers"
        />
      </FormField>
      {failed && <Alert tone="danger" title="The search failed" />}
      <Text size="xs" tone="muted" mono>
        value: {customer === null ? "null" : `"${customer}"`}
      </Text>
    </Stack>
  );
}
