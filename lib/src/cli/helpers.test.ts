import { fetchDefinitions } from "./helpers";
import * as getDefinitionsModule from "../getDefinitions";

describe("fetchDefinitions", () => {
  const getDefaultConfig = vi.spyOn(getDefinitionsModule, "getDefaultConfig");
  const getDefinitions = vi
    .spyOn(getDefinitionsModule, "getDefinitions")
    .mockImplementation(() =>
      Promise.resolve({
        version: 1,
        features: [],
      })
    );
  const clg = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("console", clg);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("returns a call to getDefinitions with default config", async () => {
    const result = await fetchDefinitions();
    expect(getDefaultConfig).toHaveBeenCalledWith("cli");
    expect(getDefinitions).toHaveBeenCalledOnce();
    expect(getDefinitions).toHaveBeenLastCalledWith({
      appName: "cli",
      token: "default:development.unleash-insecure-api-token",
      url: "http://localhost:4242/api/client/features",
    });
    expect(result).toEqual({
      version: 1,
      features: [],
    });
  });

  it("is using UNLEASH_SERVER_API_URL", async () => {
    vi.stubEnv("UNLEASH_SERVER_API_URL", "http://example.com/api");
    await fetchDefinitions();
    expect(getDefinitions).toHaveBeenLastCalledWith({
      appName: "cli",
      token: "default:development.unleash-insecure-api-token",
      url: "http://example.com/api/client/features",
    });
  });

  it("is using UNLEASH_SERVER_API_TOKEN", async () => {
    vi.stubEnv("UNLEASH_SERVER_API_TOKEN", "project:env-name.token");

    await fetchDefinitions();
    expect(clg.log).toHaveBeenCalledWith(expect.stringContaining("env-name"));
    expect(getDefinitions).toHaveBeenLastCalledWith({
      appName: "cli",
      token: "project:env-name.token",
      url: "http://localhost:4242/api/client/features",
    });
  });

  it("is using UNLEASH_SERVER_INSTANCE_ID", async () => {
    vi.stubEnv("UNLEASH_SERVER_INSTANCE_ID", "SomeInstance_ID");

    await fetchDefinitions();
    expect(getDefinitions).toHaveBeenLastCalledWith({
      appName: "cli",
      instanceId: "SomeInstance_ID",
      url: "http://localhost:4242/api/client/features",
    });
  });

  it("throws an error when the response doesn't have feature toggles", async () => {
    getDefinitions.mockImplementation(
      () =>
        Promise.resolve({
          error: "not found",
        }) as any
    );
    expect(fetchDefinitions()).rejects.toThrowError();
  });
});
