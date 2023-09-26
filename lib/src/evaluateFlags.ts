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
  let toggles: IToggle[] = [];
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
    const variant = engine.getValue(feature.name, contextWithDefaults);

    if (!variant) {
      return;
    }

    toggles.push({
      name: feature.name,
      enabled: true,
      impressionData: feature.impressionData,
      variant,
    });
  });

  toggles = toggles.filter((toggle) => {
    const feature = definitions.features.find(
      (feature) => feature.name === toggle.name
    );

    if (!feature?.dependencies?.length) {
      return true;
    }

    return feature.dependencies.every((dependencyDefinition) => {
      const parentToggle = toggles.find(
        (toggle) => toggle.name === dependencyDefinition.feature
      );

      if (parentToggle) {
        if (dependencyDefinition.enabled === false) {
          return false;
        }
      } else {
        if (dependencyDefinition.enabled !== false) {
          return false;
        }
      }

      if (dependencyDefinition.variants?.length) {
        if (
          !parentToggle?.variant?.name ||
          !dependencyDefinition.variants.includes(parentToggle?.variant?.name)
        ) {
          return false;
        }
      }

      return true;
    });
  });

  return { toggles };
};
