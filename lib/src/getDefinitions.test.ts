import {
  getDefinitions,
  getDefaultConfig,
  __resetDefinitionsCache,
} from "./getDefinitions";

const mockFetch = vi.fn();
const mockConsole = {
  warn: vi.fn(),
  error: vi.fn(),
};

const createResponse = (
  body: unknown,
  init: { status?: number; etag?: string } = {}
) => {
  const status = init.status ?? 200;
  const etag = init.etag;

  return {
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get: (header: string) =>
        header?.toLowerCase() === "etag" ? etag ?? null : null,
    },
    json: vi.fn(() => Promise.resolve(body)),
  };
};

describe("getDefinitions", () => {
  beforeAll(() => {
    vi.stubGlobal("fetch", mockFetch);
    vi.stubGlobal("console", mockConsole);
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    __resetDefinitionsCache();
  });

  it("should fetch with default config", () => {
    mockFetch.mockResolvedValue({ json: () => ({ version: 1, features: [] }) });

    expect(getDefinitions()).resolves.toEqual({
      version: 1,
      features: [],
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:4242/api/client/features",
      {
        headers: {
          authorization: "default:development.unleash-insecure-api-token",
          "content-type": "application/json",
          "user-agent": "nextjs",
          "unleash-client-spec": expect.stringMatching(/\d+\.\d+\.\d+.*/),
          "unleash-sdk": expect.stringContaining("unleash-nextjs-sdk:"),
          "unleash-appname": "nextjs",
        },
      }
    );
  });

  it("should warn about default config", () => {
    getDefinitions();

    expect(mockConsole.warn).toHaveBeenCalled();
  });

  it("should show an error when using default token", () => {
    getDefinitions();

    expect(mockConsole.error).toHaveBeenCalledWith(
      expect.stringContaining("Using fallback default token.")
    );
  });

  it("should read configuration from environment variables", () => {
    const url = "http://example.com/api";
    const token = "secure-token";
    const appName = "my-awesome-app";
    vi.stubEnv("NEXT_PUBLIC_UNLEASH_SERVER_API_URL", url);
    vi.stubEnv("UNLEASH_SERVER_API_TOKEN", token);
    vi.stubEnv("UNLEASH_APP_NAME", appName);

    getDefinitions();

    expect(mockFetch).toHaveBeenCalledWith(`${url}/client/features`, {
      headers: expect.objectContaining({
        authorization: token,
        "unleash-appname": appName,
        "user-agent": appName,
      }),
    });

    expect(mockConsole.warn).not.toHaveBeenCalled();
    expect(mockConsole.error).not.toHaveBeenCalled();
  });

  it("is using UNLEASH_SERVER_API_URL and will prioritize it over NEXT_PUBLIC_UNLEASH_SERVER_API_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_UNLEASH_SERVER_API_URL", "http://example.com/api");
    vi.stubEnv("UNLEASH_SERVER_API_URL", "http://example.org/api");

    getDefinitions();

    expect(mockFetch).toHaveBeenCalledWith(
      "http://example.org/api/client/features",
      expect.anything()
    );
  });

  it("should allow for overriding the default config", () => {
    const url = "http://example.com/api/client/features";
    const token = "secure-token";
    const appName = "my-awesome-app";

    getDefinitions({
      url,
      appName,
      token,
    });

    expect(mockFetch).toHaveBeenCalledWith(url, {
      headers: expect.objectContaining({
        authorization: token,
        "unleash-appname": appName,
        "user-agent": appName,
      }),
    });

    expect(mockConsole.warn).not.toHaveBeenCalled();
    expect(mockConsole.error).not.toHaveBeenCalled();
  });

  it('should not modify "url" in config', () => {
    const url = "http://example.com/api/";
    getDefinitions({
      url,
    });

    expect(mockFetch).toHaveBeenCalledWith(url, expect.anything());
  });

  it('should add "instanceId"', () => {
    getDefinitions({
      instanceId: "my-instance-id",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:4242/api/client/features",
      {
        headers: expect.objectContaining({
          "unleash-instanceid": "my-instance-id",
        }),
      }
    );
  });

  it('should not set default token when "instanceId" is set', () => {
    getDefinitions({
      instanceId: "my-instance-id",
    });

    expect(mockFetch).toHaveBeenCalledWith(expect.anything(), {
      headers: expect.not.objectContaining({
        Authorization: expect.anything(),
      }),
    });
  });

  it("should skip null and undefined header values from fetchOptions", async () => {
    mockFetch.mockResolvedValue({ json: () => ({ version: 1, features: [] }) });

    await getDefinitions({
      fetchOptions: {
        headers: {
          "x-defined": "value",
          "x-null": null,
          "x-undefined": undefined,
        },
      } as never,
    });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers).toHaveProperty("x-defined", "value");
    expect(options.headers).not.toHaveProperty("x-null");
    expect(options.headers).not.toHaveProperty("x-undefined");
  });

  it("should reuse ETag on subsequent requests", async () => {
    mockFetch
      .mockResolvedValueOnce(
        createResponse({ version: 1, features: [] }, { etag: "etag-1" })
      )
      .mockResolvedValueOnce(
        createResponse({ version: 1, features: [] }, { etag: "etag-2" })
      );

    await getDefinitions();
    await getDefinitions();

    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:4242/api/client/features",
      expect.objectContaining({
        headers: expect.objectContaining({
          "if-none-match": "etag-1",
        }),
      })
    );
  });

  it("should return cached definitions on 304 response", async () => {
    const firstResponse = { version: 1, features: [] };

    mockFetch
      .mockResolvedValueOnce(
        createResponse(firstResponse, { etag: "etag-1" })
      )
      .mockResolvedValueOnce(
        createResponse(undefined, { status: 304, etag: "etag-1" })
      );

    await getDefinitions();
    await expect(getDefinitions()).resolves.toEqual(firstResponse);

    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:4242/api/client/features",
      expect.objectContaining({
        headers: expect.objectContaining({
          "if-none-match": "etag-1",
        }),
      })
    );
  });

  it("should throw when receiving 304 without cache", async () => {
    mockFetch.mockResolvedValue(
      createResponse(undefined, { status: 304, etag: "etag-1" })
    );

    await expect(getDefinitions()).rejects.toThrow(
      /Received 304 Not Modified/
    );
  });

  it("should not reuse the ETag across requests with different headers", async () => {
    mockFetch.mockResolvedValue(
      createResponse({ version: 1, features: [] }, { etag: "etag-1" })
    );

    await getDefinitions({ fetchOptions: { headers: { "x-tenant": "a" } } });
    await getDefinitions({ fetchOptions: { headers: { "x-tenant": "b" } } });

    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:4242/api/client/features",
      expect.objectContaining({
        headers: expect.not.objectContaining({
          "if-none-match": expect.anything(),
        }),
      })
    );
  });

  it("should update the cached ETag when a 304 returns a new one", async () => {
    mockFetch
      .mockResolvedValueOnce(
        createResponse({ version: 1, features: [] }, { etag: "etag-1" })
      )
      .mockResolvedValueOnce(
        createResponse(undefined, { status: 304, etag: "etag-2" })
      )
      .mockResolvedValueOnce(
        createResponse(undefined, { status: 304, etag: "etag-2" })
      );

    await getDefinitions();
    await getDefinitions();
    await getDefinitions();

    expect(mockFetch).toHaveBeenNthCalledWith(
      3,
      "http://localhost:4242/api/client/features",
      expect.objectContaining({
        headers: expect.objectContaining({
          "if-none-match": "etag-2",
        }),
      })
    );
  });

  it("should evict the oldest entry once the cache is full", async () => {
    const MAX_CACHE_ENTRIES = 100;
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        createResponse({ version: 1, features: [] }, { etag: "etag" })
      )
    );

    // First request for the oldest key populates the cache.
    await getDefinitions({ fetchOptions: { headers: { "x-key": "0" } } });

    // Fill the cache with enough distinct keys to evict key "0".
    for (let i = 1; i <= MAX_CACHE_ENTRIES; i++) {
      await getDefinitions({ fetchOptions: { headers: { "x-key": `${i}` } } });
    }

    mockFetch.mockClear();

    // Re-requesting the evicted key must not send a cached ETag.
    await getDefinitions({ fetchOptions: { headers: { "x-key": "0" } } });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:4242/api/client/features",
      expect.objectContaining({
        headers: expect.not.objectContaining({
          "if-none-match": expect.anything(),
        }),
      })
    );
  });
});

describe("getDefaultConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should support UNLEASH_SERVER_API_URL with trailing slash", () => {
    vi.stubEnv("UNLEASH_SERVER_API_URL", "http://example.com/api/");

    expect(getDefaultConfig()).toHaveProperty(
      "url",
      "http://example.com/api/client/features"
    );
  });
  it("should support NEXT_PUBLIC_UNLEASH_SERVER_API_URL with trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_UNLEASH_SERVER_API_URL", "http://example.org/api/");

    expect(getDefaultConfig()).toHaveProperty(
      "url",
      "http://example.org/api/client/features"
    );
  });

  it("should set defaultToken", () => {
    expect(getDefaultConfig()).toHaveProperty(
      "token",
      "default:development.unleash-insecure-api-token"
    );
  });

  it("shouldn't set defaultToken when UNLEASH_SERVER_INSTANCE_ID is set", () => {
    vi.stubEnv("UNLEASH_SERVER_INSTANCE_ID", "instance-id-token");

    expect(getDefaultConfig()).not.toHaveProperty("token");
  });
});
