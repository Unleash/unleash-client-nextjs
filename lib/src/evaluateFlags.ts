import type { ClientFeaturesResponse, Context } from "unleash-client";
import type { IToggle } from "unleash-proxy-client";
import { ToggleEngine } from "./core/engine";

/**
 * Turn server-side feature flags definitions (state from Unleash)
 * into a list of toggles that can be used with a client-side SDK
 */
export const evaluateFlags = (
  definitions: ClientFeaturesResponse,
  context: Context = {}
) => {
  const engine = new ToggleEngine(definitions);
  const toggles: IToggle[] = [];
  const defaultContext: Context = {
    currentTime: new Date(),
    appName:
      process.env.UNLEASH_APP_NAME || process.env.NEXT_PUBLIC_UNLEASH_APP_NAME,
  };
  const contextWithDefaults = {
    ...defaultContext,
    ...context,
  };

  definitions?.features?.forEach((feature) => {
    const enabled = engine.isEnabled(feature.name, contextWithDefaults);
    if (!enabled) {
      return;
    }

    const variant = engine.getVariant(feature.name, contextWithDefaults);
    if (variant.payload === undefined) {
      delete variant.payload; // cleanup before serialization
    }

    toggles.push({
      name: feature.name,
      enabled,
      impressionData: feature.impressionData,
      variant,
    });
  });

  return { toggles };
};
