import { FlagProvider, useFlag, useFlagsStatus } from "@unleash/nextjs";
import { LoadingDots } from "@vercel/examples-ui";
import type { NextPage } from "next";

const ExampleComponent = () => {
  const isEnabled = useFlag("snowing");
  const { flagsReady } = useFlagsStatus();

  if (!flagsReady) {
    return <LoadingDots />;
  }

  return <>{isEnabled ? "ENABLED" : "DISABLED"}</>;
};

const ClientSideRenderedPage: NextPage = () => (
  <FlagProvider
    config={{
      url: `${
        process.env.NEXT_PUBLIC_UNLEASH_BASE_URL || "http://localhost:4242/api"
      }/frontend`,
      appName: process.env.NEXT_PUBLIC_UNLEASH_APP_NAME || "nextjs",
      clientKey: process.env.NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN || "",
      refreshInterval: 15,
    }}
  >
    <ExampleComponent />
  </FlagProvider>
);

export default ClientSideRenderedPage;
