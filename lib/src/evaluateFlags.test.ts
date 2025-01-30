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
    vi.spyOn(console, "error").mockImplementationOnce(() => {});

    const definitions = {
      message: "Invalid definitions",
    };

    const result = evaluateFlags(definitions as any, {});

    expect(result).toEqual({
      toggles: [],
    });

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        "Unleash: Failed to evaluate flags from provided definitions"
      ),
      expect.anything()
    );
  });
});
