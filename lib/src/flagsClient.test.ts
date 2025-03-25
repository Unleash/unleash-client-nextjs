import { flagsClient } from "./flagsClient";

const fetchMock = vi.fn();
global.fetch = fetchMock;

describe("flagsClient", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

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

  it("should not send metrics", async () => {
    const client = flagsClient(
      [
        {
          name: "foo",
          enabled: true,
          variant: { name: "disabled", enabled: false },
          impressionData: false,
        },
      ],
      {
        url: 'http://test.com/api',
        appName: 'custom-app-name',
        clientKey: 'a-very-nice-very-secure-custom-key'
      }
    );

    await client.sendMetrics();

    expect(fetchMock).toHaveBeenCalledTimes(0);
  });

  it("should send metrics", async () => {
    const client = flagsClient(
      [
        {
          name: "foo",
          enabled: true,
          variant: { name: "disabled", enabled: false },
          impressionData: false,
        },
      ],
      {
        url: 'http://test.com/api',
        appName: 'custom-app-name',
        clientKey: 'a-very-nice-very-secure-custom-key'
      }
    );

    client.getVariant('foo');

    await client.sendMetrics();

    expect(fetchMock).toHaveBeenCalled();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://test.com/api/client/metrics',
      expect.objectContaining({
        method: 'POST',
        cache: 'no-cache',
        headers: {
          authorization: 'a-very-nice-very-secure-custom-key',
          accept: 'application/json',
          'content-type': 'application/json',
          'unleash-appname': 'custom-app-name',
          'unleash-connection-id': expect.stringMatching(/[a-f0-9-]{36}/),
          'unleash-sdk': expect.stringMatching(/^unleash-client-js:\d+\.\d+\.\d+/),
        },
        body: expect.stringContaining('custom-app-name'),
      })
    );
  });

  it("should return correct variant if called multiple times (Issue #106)", async () => {
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
    ]);

    const results = [];
    const expected = [];

    for (let i = 0; i < 10; i++) {
      await true;
      results.push(client.getVariant("foo"));
      expected.push({
        name: "A",
        enabled: true,
        feature_enabled: true,
        payload: {
          type: "string",
          value: "FOO",
        },
      });
    }

    expect(results).toEqual(expected);
  });
});
