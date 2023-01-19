import type { IToggle, IMutableContext } from "unleash-proxy-client";
import { UnleashClient } from "unleash-proxy-client";
import { defaultClientConfig } from "./utils";

/**
 * Create a client-side SDK instance and get evaluated flags from Unleash Proxy or Client API
 * @see clientOptions https://github.com/Unleash/unleash-proxy-client-js#available-options
 */
export const getFrontendFlags = async (
  config?: Partial<ConstructorParameters<typeof UnleashClient>[0]>
) =>
  new Promise<{ toggles: IToggle[] }>((resolve) => {
    const unleash = new UnleashClient({
      ...defaultClientConfig,
      ...(config || {}),
      disableRefresh: true,
      disableMetrics: true,
    });

    unleash.on("ready", () => {
      resolve({ toggles: unleash.getAllToggles() });
      unleash.stop();
    });

    unleash.start();
  });
