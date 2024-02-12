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
): {
  toggles: IToggle[];
} => {
  const engine = new ToggleEngine(definitions);
  const defaultContext: Context = {
    currentTime: new Date(),
    appName:
      process.env.UNLEASH_APP_NAME || process.env.NEXT_PUBLIC_UNLEASH_APP_NAME,
  };
  const contextWithDefaults = {
    ...defaultContext,
    ...context,
  };

  const features = definitions?.features?.map((feature) => {
    const variant = engine.getValue(feature.name, contextWithDefaults);

    return {
      name: feature.name,
      enabled: Boolean(variant),
      impressionData: Boolean(feature.impressionData),
      variant: variant || { enabled: false, name: "disabled" },
      dependencies: feature.dependencies,
    };
  });

  const toggles = features
    .filter((feature) => {
      if (feature.enabled === false) return false;

      if (!feature?.dependencies?.length) return true;

      return feature.dependencies.every((dependency) => {
        const parentToggle = features.find(
          (toggle) => toggle.name === dependency.feature
        );

        if (!parentToggle)
          console.warn(
            `Unleash: \`${feature.name}\` has unresolved dependency \`${dependency.feature}\`.`
          );

        if (parentToggle?.dependencies?.length) {
          console.warn(
            `Unleash: \`${feature.name}\` cannot depend on \`${dependency.feature}\` which also has dependencies.`
          );
          return false;
        }

        if (parentToggle?.enabled && dependency.enabled === false) return false;
        if (!parentToggle?.enabled && dependency.enabled !== false)
          return false;

        if (
          dependency.variants?.length &&
          (!parentToggle?.variant.name ||
            !dependency.variants.includes(parentToggle.variant.name))
        )
          return false;

        return true;
      });
    })
    .map((feature) => ({
      name: feature.name,
      enabled: feature.enabled,
      variant: { ...feature.variant, feature_enabled: feature.enabled },
      impressionData: feature.impressionData,
    }));

  return { toggles };
};
