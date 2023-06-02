import { FlagProvider, useFlag, useFlagsStatus } from "@unleash/nextjs/client";
import { LoadingDots } from "@vercel/examples-ui";
import type { NextPage } from "next";

const ExampleComponent = () => {
  const isEnabled = useFlag("nextjs-example");
  const { flagsReady } = useFlagsStatus();

  if (!flagsReady) {
    return <LoadingDots />;
  }

  return <>Feature toggle is: {isEnabled ? "ENABLED" : "DISABLED"}</>;
};

const ClientSideRenderedPage: NextPage = () => (
  <FlagProvider>
    <ExampleComponent />
  </FlagProvider>
);

export default ClientSideRenderedPage;
