import type { AppProps } from "next/app";
import { FlagProvider } from "@unleash/nextjs";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FlagProvider
      config={{
        url: `${
          process.env.NEXT_PUBLIC_UNLEASH_BASE_URL ||
          "http://localhost:4242/api"
        }/frontend`,
        appName: process.env.NEXT_PUBLIC_UNLEASH_APP_NAME || "nextjs",
        clientKey: process.env.NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN || "",
        refreshInterval: 15,
      }}
    >
      <Component {...pageProps} />
    </FlagProvider>
  );
}
