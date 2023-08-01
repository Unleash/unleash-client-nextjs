import { cookies } from "next/headers";
import {
  evaluateFlags,
  flag,
  flagsClient,
  getDefinitions,
} from "@unleash/nextjs";
import { Text } from "@vercel/examples-ui";
import ServerComponent from "./ServerComponent";

export const runtime = "edge";

const COOKIE_NAME = "unleash-session-id";

// You can build a purpose-fit logic out of building blocks in the SDK
const getData = async () => {
  const cookieStore = cookies();
  const sessionId =
    cookieStore.get(COOKIE_NAME)?.value ||
    `${Math.floor(Math.random() * 1_000_000_000)}`;

  try {
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
      sessionId,
    };
  } catch (_error: unknown) {}

  return {
    isEnabled: false,
    count: 0,
    sessionId,
  };
};

export default async function Page() {
  const { isEnabled, count, sessionId } = await getData();

  // 'flag' function from SDK is configurable
  const { variant } = await flag(
    "nextjs-example",
    {
      sessionId: cookies().get(COOKIE_NAME)?.value || "0", // context
    },
    { fetchOptions: { next: { revalidate: 30 } } } // getDefinitions options
  );
  const name = variant?.payload?.value || "N/A";

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
        We loaded and cached definitions for <strong>{count}</strong> feature
        flags from Unleash.
      </p>
      <p>
        Your session-id is <code>{sessionId}</code>.
      </p>
      {/* Only "page" level server-side components are async,
          so flags resolved on a server need to be passed as props */}
      <ServerComponent name={name} />
    </>
  );
}
