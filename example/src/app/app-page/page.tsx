import { cookies } from "next/headers";
import {
  evaluateFlags,
  flagsClient,
  getDefinitions,
} from "@unleash/nextjs";
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
    sessionId, // it is important to provide sticky field for a consistent user experience (https://docs.getunleash.io/reference/stickiness#calculation)
  });
  const flags = flagsClient(toggles);

  return {
    isEnabled: flags.isEnabled("nextjs-example"),
    count: definitions?.features?.length || 0,
    variant: flags.getVariant("nextjs-example")?.name || "N/A",
    sessionId,
  };
};

export default async function Page() {
  const { isEnabled, count, variant, sessionId } = await getData();

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
        We loaded and cached definitions for <strong>{count}</strong> feature
        flags from Unleash.
      </p>
      <p>
        Your session-id is <code>{sessionId}</code>.
      </p>
    </>
  );
}
