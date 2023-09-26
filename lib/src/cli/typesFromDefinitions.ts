import type { ClientFeaturesResponse } from "unleash-client";

export const typesFromDefinitions = (definitions: ClientFeaturesResponse) => {
  const { features } = definitions;

  const featureVariants = features.length
    ? "export type FeaturesVariantMap = {" +
      features
        .map(({ name, variants }) => {
          if (!variants?.length) {
            return `\n  "${name}": [{ "name": "disabled", "enabled": false }]`;
          }

          return `\n  "${name}": [${variants
            ?.map(
              (variant) =>
                `${variants.length > 1 ? "\n    " : ""}{ "name": "${
                  variant.name
                }"; "enabled": true; "payload": ${JSON.stringify(
                  variant.payload
                )} }`
            )
            .join(" |")}]`;
        })
        .join(",") +
      "\n};"
    : "export type FeaturesVariantMap = {};";

  return `${featureVariants}

export type FeatureName = keyof FeaturesVariantMap;

export type FeatureVariants = {
  [T in FeatureName]: FeaturesVariantMap[T];
};

type FeaturesMap = {
  [T in FeatureName]: {
    name: T;
    enabled: boolean;
    variant: FeatureVariants[T][number];
    impressionData: boolean;
  };
};

export type Features = Array<FeaturesMap[keyof FeaturesMap]>;
`;
};
