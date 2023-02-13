import { fetchDefinitions } from "./helpers";
import * as getDefinitionsModule from "../getDefinitions";

describe("fetchDefinitions", () => {
  const getDefinitions = vi.spyOn(getDefinitionsModule, "getDefinitions");
  getDefinitions.mockResolvedValue({
    version: 1,
    features: [],
  });
  const getDefaultConfig = vi.spyOn(getDefinitionsModule, "getDefaultConfig");
  const clg = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  vi.stubGlobal("console", clg);

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
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

  it("is using UNLEASH_URL", () => {
    vi.stubEnv("UNLEASH_URL", "http://example.com/api");
    fetchDefinitions();
    expect(getDefinitions).toHaveBeenLastCalledWith({
      appName: "cli",
      token: "default:development.unleash-insecure-api-token",
      url: "http://example.com/api/client/features",
    });
  });

  it("is using UNLEASH_TOKEN", () => {
    vi.stubEnv("UNLEASH_TOKEN", "project:env-name.token");

    fetchDefinitions();
    expect(clg.log).toHaveBeenCalledWith(expect.stringContaining("env-name"));
    expect(getDefinitions).toHaveBeenLastCalledWith({
      appName: "cli",
      token: "project:env-name.token",
      url: "http://localhost:4242/api/client/features",
    });
  });
});
