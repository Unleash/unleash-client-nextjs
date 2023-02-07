import { getDefaultClientConfig } from "./utils";

describe("getDefaultClientConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should return the default config", () => {
    expect(getDefaultClientConfig()).toEqual({
      url: "http://localhost:4242/api/frontend",
      appName: "nextjs",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });
  });

  it("should use NEXT_PUBLIC_UNLEASH_SERVER_API_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_UNLEASH_SERVER_API_URL", "http://example.com/api");

    expect(getDefaultClientConfig()).toEqual({
      url: "http://example.com/api/frontend",
      appName: "nextjs",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });
  });

  it("should use `UNLEASH_SERVER_API_URL` and prioritize it over `NEXT_PUBLIC_UNLEASH_SERVER_API_URL` when available", () => {
    vi.stubEnv("NEXT_PUBLIC_UNLEASH_SERVER_API_URL", "http://example.com/api");
    vi.stubEnv("UNLEASH_SERVER_API_URL", "http://example.org/api");

    expect(getDefaultClientConfig()).toEqual({
      url: "http://example.org/api/frontend",
      appName: "nextjs",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });
  });

  it("should use NEXT_PUBLIC_UNLEASH_FRONTEND_API_URL", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_UNLEASH_FRONTEND_API_URL",
      "http://example.com/proxy"
    );

    expect(getDefaultClientConfig()).toEqual({
      url: "http://example.com/proxy",
      appName: "nextjs",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });
  });

  it("should use UNLEASH_FRONTEND_API_URL and prioritize it over `NEXT_PUBLIC_UNLEASH_FRONTEND_API_URL` when available", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_UNLEASH_FRONTEND_API_URL",
      "http://example.com/proxy"
    );
    vi.stubEnv("UNLEASH_FRONTEND_API_URL", "http://example.org/api/frontend");

    expect(getDefaultClientConfig()).toEqual({
      url: "http://example.org/api/frontend",
      appName: "nextjs",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });
  });

  it("should use NEXT_PUBLIC_UNLEASH_APP_NAME", () => {
    vi.stubEnv("NEXT_PUBLIC_UNLEASH_APP_NAME", "my-app");

    expect(getDefaultClientConfig()).toEqual({
      url: "http://localhost:4242/api/frontend",
      appName: "my-app",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });
  });

  it("should use `UNLEASH_APP_NAME` and prioritize it over `NEXT_PUBLIC_UNLEASH_APP_NAME` when available", () => {
    vi.stubEnv("NEXT_PUBLIC_UNLEASH_APP_NAME", "my-app");
    vi.stubEnv("UNLEASH_APP_NAME", "my-app-override");

    expect(getDefaultClientConfig()).toEqual({
      url: "http://localhost:4242/api/frontend",
      appName: "my-app-override",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });
  });

  it("should use NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN", () => {
    vi.stubEnv("NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN", "my-token");

    expect(getDefaultClientConfig()).toEqual({
      url: "http://localhost:4242/api/frontend",
      clientKey: "my-token",
      appName: "nextjs",
    });
  });

  it("should use `UNLEASH_FRONTEND_API_TOKEN` and prioritize it over `NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN` when available", () => {
    vi.stubEnv("NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN", "my-token");
    vi.stubEnv("UNLEASH_FRONTEND_API_TOKEN", "my-token-override");

    expect(getDefaultClientConfig()).toEqual({
      url: "http://localhost:4242/api/frontend",
      clientKey: "my-token-override",
      appName: "nextjs",
    });
  });

  it("should use warn about using NEXT_PUBLIC_UNLEASH_SERVER_API_TOKEN", () => {
    vi.stubEnv("NEXT_PUBLIC_UNLEASH_SERVER_API_TOKEN", "insecure-token");

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(getDefaultClientConfig()).toEqual({
      url: "http://localhost:4242/api/frontend",
      appName: "nextjs",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Server keys shouldn't be public.")
    );
  });
});
