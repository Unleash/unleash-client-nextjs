import { UnleashClient, type IToggle } from "unleash-proxy-client";
import { getDefaultClientConfig } from "./utils";

/**
 * Simplified client SDK to work offline with pre-evaluated flags
 */
export const flagsClient = (toggles = [] as IToggle[]) => {
  const client = new UnleashClient({
    bootstrap: toggles,
    ...getDefaultClientConfig(),
    refreshInterval: 0,
    disableRefresh: true,
    bootstrapOverride: true,
    disableMetrics: true,
    storageProvider: {
      get: async (_name: string) => {},
      save: async (_name: string, _value: string) => {},
    },
  });

  return {
    isEnabled: (name: string) => client.isEnabled(name),
    getVariant: (name: string) => client.getVariant(name),
  };
};
