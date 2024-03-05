import { flagsClient } from "./flagsClient";

describe("flagsClient", () => {
  global.fetch = vi.fn();

  it("should return methods", () => {
    const client = flagsClient();
    expect(client).toHaveProperty("isEnabled");
    expect(client).toHaveProperty("getVariant");
  });

  it("should return correct values for isEnabled", () => {
    const client = flagsClient([
      {
        name: "foo",
        enabled: true,
        variant: { name: "disabled", enabled: false },
        impressionData: false,
      },
      {
        name: "bar",
        enabled: false,
        variant: { name: "disabled", enabled: false },
        impressionData: false,
      },
    ]);

    expect(client.isEnabled("foo")).toBe(true);
    expect(client.isEnabled("bar")).toBe(false);
  });

  it("should resolve variant", () => {
    const client = flagsClient([
      {
        name: "foo",
        enabled: true,
        variant: {
          name: "A",
          enabled: true,
          payload: {
            type: "string",
            value: "FOO",
          },
        },
        impressionData: false,
      },
      {
        name: "bar",
        enabled: true,
        variant: { name: "disabled", enabled: false },
        impressionData: false,
      },
    ]);

    expect(client.getVariant("foo")).toEqual({
      name: "A",
      enabled: true,
      feature_enabled: true,
      payload: {
        type: "string",
        value: "FOO",
      },
    });
    expect(client.getVariant("bar")).toEqual({
      name: "disabled",
      enabled: false,
      feature_enabled: true,
    });
  });
});
