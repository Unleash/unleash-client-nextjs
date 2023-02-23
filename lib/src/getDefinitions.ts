import type { ClientFeaturesResponse } from "unleash-client";

const defaultUrl = "http://localhost:4242/api/client/features";

export const getDefaultConfig = (defaultAppName = "nextjs") => {
  const baseUrl =
    process.env.UNLEASH_SERVER_API_URL ||
    process.env.NEXT_PUBLIC_UNLEASH_SERVER_API_URL;

  return {
    appName:
      process.env.UNLEASH_APP_NAME ||
      process.env.NEXT_PUBLIC_UNLEASH_APP_NAME ||
      defaultAppName,
    url: baseUrl ? `${baseUrl}/client/features` : defaultUrl,
    instanceId: process.env.UNLEASH_SERVER_INSTANCE_ID,
    token: process.env.UNLEASH_SERVER_API_TOKEN,
    fetchOptions: {} as RequestInit,
  };
};

/**
 * Fetch Server-side feature flags definitions from Unleash API
 */
export const getDefinitions = async (
  config?: Partial<ReturnType<typeof getDefaultConfig>>
) => {
  const {
    appName,
    url,
    token,
    instanceId,
    fetchOptions: { headers = {}, ...options },
  } = {
    ...getDefaultConfig(),
    ...(config || {}),
  };

  if (url === defaultUrl) {
    console.warn(
      "Using fallback Unleash API URL (http://localhost:4242/api).",
      "Provide a URL or set UNLEASH_SERVER_API_URL environment variable."
    );
  }
  if (!token && !instanceId) {
    console.warn(
      "Neither token nor instanceId is used. " +
        "Pass token or set UNLEASH_SERVER_API_TOKEN or UNLEASH_SERVER_INSTANCE_ID environment variable."
    );
  }

  const fetchUrl = new URL(url);

  if (token) {
    Object.assign(headers, { Authorization: token });
  }

  if (instanceId) {
    fetchUrl.searchParams.append('instance_id', instanceId)
  }

  const response = await fetch(fetchUrl.toString(), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "UNLEASH-APPNAME": appName,
      "User-Agent": appName,
      ...headers,
    },
  });

  return response?.json() as Promise<ClientFeaturesResponse>;
};
