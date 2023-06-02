import { FlagProvider } from "@unleash/nextjs/client";
import ClientComponent from "./_ClientComponent";
import { cookies } from "next/headers";

const COOKIE_NAME = "unleash-session-id";

export default async function Page() {
  const sessionId =
    cookies().get(COOKIE_NAME)?.value ||
    `${Math.floor(Math.random() * 1_000_000_000)}`;

  // Cookies are read-only here.
  // Set cookie in middleware or store sessionId in local storage if you need stable evaluation

  return (
    <FlagProvider config={{ context: { sessionId } }}>
      <ClientComponent />
    </FlagProvider>
  );
}
