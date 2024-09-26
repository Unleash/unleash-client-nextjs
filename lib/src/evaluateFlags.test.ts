import { evaluateFlags } from "./evaluateFlags";
import type { ClientFeaturesResponse } from "unleash-client";

describe("evaluateFlags", () => {
  it("should return toggles when engine initializes successfully", () => {
    const definitions: ClientFeaturesResponse = {
      version: 1,
      features: [
        { name: "featureA", enabled: true },
        { name: "featureB", enabled: false },
      ],
    };

    const result = evaluateFlags(definitions, {});

    expect(result).toEqual({
      toggles: [
        {
          name: "featureA",
          enabled: true,
          impressionData: false,
          variant: {
            enabled: false,
            feature_enabled: true,
            name: "disabled",
          },
        },
      ],
    });
  });

  it("should return empty toggles when engine initialization fails", () => {
    const definitions = {
      message: "Invalid definitions",
    };

    const result = evaluateFlags(definitions as any, {});

    expect(result).toEqual({
      toggles: [],
    });
  });
});
