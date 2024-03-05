import { typesFromDefinitions } from "./typesFromDefinitions";

describe("typesFromDefinitions", () => {
  it("should generate types from empty definitions", () => {
    expect(typesFromDefinitions({ version: 1, features: [] }))
      .toMatchInlineSnapshot(`
        "export type FeaturesVariantMap = {};
        
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
        "`);
  });

  it("should generate types from definitions", () => {
    expect(
      typesFromDefinitions({
        version: 1,
        features: [
          {
            name: "feature1",
            description: "feature1",
            enabled: true,
            strategies: [],
            variants: [
              {
                name: "variant1",
                weight: 100,
                payload: {
                  type: "string",
                  value: "variant1",
                },
              },
            ],
          },
          {
            name: "feature2",
            description: "feature2",
            enabled: true,
            strategies: [],
            variants: [
              {
                name: "variant1",
                weight: 100,
                payload: {
                  type: "string",
                  value: "variant1",
                },
              },
              {
                name: "variant2",
                weight: 100,
                payload: {
                  type: "string",
                  value: "variant2",
                },
              },
            ],
          },
        ],
      } as any)
    ).toMatchInlineSnapshot(`
      "export type FeaturesVariantMap = {
        "feature1": [{ "name": "variant1"; "enabled": true; "payload": {"type":"string","value":"variant1"} }],
        "feature2": [
          { "name": "variant1"; "enabled": true; "payload": {"type":"string","value":"variant1"} } |
          { "name": "variant2"; "enabled": true; "payload": {"type":"string","value":"variant2"} }]
      };

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
      "
    `);
  });

  it("should deal with features without variants", () => {
    expect(
      typesFromDefinitions({
        version: 1,
        features: [
          {
            name: "feature1",
            description: "feature1",
            enabled: true,
            strategies: [],
          },
        ],
      } as any)
    ).toMatchInlineSnapshot(`
      "export type FeaturesVariantMap = {
        "feature1": [{ "name": "disabled", "enabled": false }]
      };

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
      "
    `);
  });
});
