import type { ClientFeaturesResponse, Context } from "unleash-client";
import type { IToggle } from "unleash-proxy-client";
import { ToggleEngine } from "./core/engine";

/**
 * Turn server-side feature flags definitions (state from Unleash)
 * into a list of toggles that can be used with a client-side SDK
 */
export const evaluateFlags = (
  definitions: ClientFeaturesResponse,
  context: Context
) => {
  const engine = new ToggleEngine(definitions);
  const toggles: IToggle[] = [];

  definitions?.features?.forEach((feature) => {
    const enabled = engine.isEnabled(feature.name, context);
    if (!enabled) {
      return;
    }

    const variant = engine.getVariant(feature.name, context);
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
