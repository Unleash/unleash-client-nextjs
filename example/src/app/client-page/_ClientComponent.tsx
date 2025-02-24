"use client";

import { useFlag, useFlagsStatus, useVariant } from "@unleash/nextjs/client";
import { LoadingDots } from "@vercel/examples-ui";

export default function ClientComponent() {
  const isEnabled = useFlag("example-flag");
  const variant = useVariant("example-flag");
  const { flagsReady } = useFlagsStatus();

  if (!flagsReady) {
    return <LoadingDots />;
  }

  return (
    <>
      Feature toggle is: <strong>{isEnabled ? "ENABLED" : "DISABLED"}</strong>
      <br />
      Variant: <pre>{JSON.stringify(variant, null, 2)}</pre>
    </>
  );
}
