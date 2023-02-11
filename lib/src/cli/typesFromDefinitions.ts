import { ClientFeaturesResponse } from "unleash-client";

export const typesFromDefinitions = (definitions: ClientFeaturesResponse) => {
  const { features } = definitions;

  const featureVariants =
    "export type FeaturesVariantMap = {\n" +
    features
      .map(({ name, variants }) => {
        if (!variants?.length) {
          return `  "${name}": ${JSON.stringify([
            { name: "disabled", enabled: false },
          ])}`;
        }

        return `  "${name}": [${variants
          ?.map(
            (variant) =>
              `{ "name": "${
                variant.name
              }"; "enabled": true; "payload": ${JSON.stringify(
                variant.payload
              )} }`
          )
          .join(" |\n    ")}]`;
      })
      .join(",\n") +
    "};";

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
