import type { ClientFeaturesResponse } from "unleash-client";
import { removeTrailingSlash } from "./utils";

const defaultUrl = "http://localhost:4242/api/client/features";
const defaultToken = "default:development.unleash-insecure-api-token";

export const getDefaultConfig = (defaultAppName = "nextjs") => {
  const baseUrl = removeTrailingSlash(
    process.env.UNLEASH_SERVER_API_URL ||
      process.env.NEXT_PUBLIC_UNLEASH_SERVER_API_URL
  );

  return {
    appName:
      process.env.UNLEASH_APP_NAME ||
      process.env.NEXT_PUBLIC_UNLEASH_APP_NAME ||
      defaultAppName,
    url: baseUrl ? `${baseUrl}/client/features` : defaultUrl,
    token: process.env.UNLEASH_SERVER_API_TOKEN || defaultToken,
    fetchOptions: {} as RequestInit,
  };
};

/**
 * Fetch Server-side feature flags definitions from Unleash API
 *
 * If you provide `url` in the config parameter, it should be a full endpoint path:
 * @example getDefinitions({ url: `http://localhost:4242/api/client/features` })
 */
export const getDefinitions = async (
  config?: Partial<ReturnType<typeof getDefaultConfig>>
) => {
  const { appName, url, token, fetchOptions } = {
    ...getDefaultConfig(),
    ...(config || {}),
  };

  if (url === defaultUrl) {
    console.warn(
      "Using fallback Unleash API URL (http://localhost:4242/api).",
      "Provide a URL or set UNLEASH_SERVER_API_URL environment variable."
    );
  }
  if (token === defaultToken) {
    console.error(
      "Using fallback default token. Pass token or set UNLEASH_SERVER_API_TOKEN environment variable."
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
