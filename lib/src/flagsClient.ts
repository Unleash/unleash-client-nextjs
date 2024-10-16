import { UnleashClient, type IToggle } from "unleash-proxy-client";
import { getDefaultClientConfig, getServerBaseUrl } from "./utils";

const getMetricsConfig = () => {
  const serverUrl = getServerBaseUrl()

  if (serverUrl && process.env.UNLEASH_SERVER_API_TOKEN){
    return {
      ...getDefaultClientConfig(),
      url: serverUrl,
      clientKey: process.env.UNLEASH_SERVER_API_TOKEN,
    }
  }

  return getDefaultClientConfig()
}

/**
 * Simplified client SDK to work offline with pre-evaluated flags
 */
export const flagsClient = (toggles = [] as IToggle[]) => {
  const client = new UnleashClient({
    bootstrap: toggles,
    ...getMetricsConfig(),
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

  return {
    isEnabled: (name: string) => client.isEnabled(name),
    getVariant: (name: string) => client.getVariant(name),
    sendMetrics: () => client.sendMetrics(),
  };
};
