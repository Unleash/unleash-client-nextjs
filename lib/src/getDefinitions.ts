import type { ClientFeaturesResponse } from "unleash-client";

const defaultUrl = "http://localhost:4242/api/client/features";
const baseUrl =
  process.env.UNLEASH_BASE_URL || process.env.NEXT_PUBLIC_UNLEASH_BASE_URL;

const defaultConfig = {
  appName:
    process.env.UNLEASH_APP_NAME ||
    process.env.NEXT_PUBLIC_UNLEASH_APP_NAME ||
    "nextjs",
  url: baseUrl ? `${baseUrl}/client/features` : defaultUrl,
  token: process.env.UNLEASH_API_TOKEN || "",
  fetchOptions: {} as RequestInit,
};

/**
 * Fetch Server-side feature flags definitions from Unleash API
 */
export const getDefinitions = async (
  config?: Partial<typeof defaultConfig>
) => {
  const { appName, url, token, fetchOptions } = {
    ...defaultConfig,
    ...(config || {}),
  };

  if (url === defaultUrl) {
    console.warn(
      "Using fallback Unleash API URL (http://localhost:4242/api).",
      "Provide a URL or set UNLEASH_BASE_URL environment variable."
    );
  }
  if (!token) {
    console.error(
      "Provide token or set UNLEASH_API_TOKEN environment variable."
    );
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      "UNLEASH-APPNAME": appName,
      "User-Agent": appName,
      Authorization: token,
      ...(fetchOptions.headers || {}),
    },
  });

  return response?.json() as Promise<ClientFeaturesResponse>;
};
