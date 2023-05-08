import { cookies } from "next/headers";
import {
  evaluateFlags,
  flagsClient,
  getDefinitions,
} from "@unleash/nextjs/server";
import { Text } from "@vercel/examples-ui";

export const runtime = "edge";

const COOKIE_NAME = "unleash-session-id";

const getData = async () => {
  const cookieStore = cookies();
  const sessionId =
    cookieStore.get(COOKIE_NAME)?.value ||
    `${Math.floor(Math.random() * 1_000_000_000)}`;

  const definitions = await getDefinitions({
    fetchOptions: {
      // Cache definitions decreasing load on Unleash
      next: { revalidate: 15 }, // This works like Unleash Proxy! 🎉
    },
  });

  const { toggles } = await evaluateFlags(definitions, {
    sessionId, // it is very important to provide sticky field for consistent experience
  });
  const flags = flagsClient(toggles);

  return {
    isEnabled: flags.isEnabled("nextjs-example"),
    count: definitions?.features?.length || 0,
    variant: flags.getVariant("nextjs-example")?.name || "N/A",
  };
};

export default async function Page() {
  const { isEnabled, count, variant } = await getData();

  return (
    <>
      <Text variant="h1" className="mb-8">
        App directory page
      </Text>
      <p>This page is server-side rendered.</p>
      <p>
        Feature flag <code>nextjs-example</code> is{" "}
        <strong>
          <code>{isEnabled ? "ENABLED" : "DISABLED"}</code>
        </strong>
        .
      </p>
      <p>
        Variant assigned is <strong>{variant}</strong>.
      </p>
      <p>
        We loaded definitions for <strong>{count}</strong> feature flags from
        Unleash.
      </p>
    </>
  );
}
