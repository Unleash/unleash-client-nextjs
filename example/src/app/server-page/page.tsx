import { flag } from "@unleash/nextjs";
import { Text } from "@vercel/examples-ui";

export const runtime = "edge";

export default async function Page() {
  const { enabled } = await flag("example-flag");

  return (
    <>
      <Text variant="h1" className="mb-8">
        Simple use case
      </Text>
      <p>This page is server-side rendered.</p>
      <p>
        Feature flag <code>example-flag</code> is{" "}
        <strong>
          <code>{enabled ? "ENABLED" : "DISABLED"}</code>
        </strong>
        .
      </p>
    </>
  );
}
