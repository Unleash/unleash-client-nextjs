import { UnleashClient, type IToggle } from "unleash-proxy-client";
import {
  getDefaultClientConfig,
  getDefaultServerConfig,
  getServerBaseUrl,
} from "./utils";

const getMetricsConfig = () => {
  const serverUrl = getServerBaseUrl();

  if (serverUrl && process.env.UNLEASH_SERVER_API_TOKEN) {
    return getDefaultServerConfig();
  }

  return getDefaultClientConfig();
};

/**
 * Simplified client SDK to work offline with pre-evaluated flags
 */
export const flagsClient = (
  toggles = [] as IToggle[],
  config?: Partial<ReturnType<typeof getMetricsConfig>>
) => {
  const { appName, url, clientKey } = {
    ...getMetricsConfig(),
    ...(config || {}),
  };

  const client = new UnleashClient({
    url,
    appName,
    clientKey,
    bootstrap: toggles,
    createAbortController: () => null,
    refreshInterval: 0,
    metricsInterval: 0,
    disableRefresh: true,
    bootstrapOverride: true,
    storageProvider: {
      get: async (_name: string) => {},
      save: async (_name: string, _value: string) => {},
    },
  });

  return client;
};
