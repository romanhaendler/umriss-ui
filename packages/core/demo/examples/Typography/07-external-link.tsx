import { Link, Text } from "../../../src";

export const title = "Link out of the application";
export const lead = "Set `external` for a link that leaves the application: it opens a new tab and cuts the new page's access to this one.";

export default function ExternalLink() {
  return (
    <Text size="sm">
      Card payments time out at the provider.{" "}
      <Link href="https://status.example.org" external>
        Provider status page
      </Link>{" "}
      · <Link href="#/typography">Incident INC-1048</Link>
    </Text>
  );
}
