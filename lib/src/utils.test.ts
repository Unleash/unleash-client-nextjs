import {
  getDefaultClientConfig,
  removeTrailingSlash,
  safeCompare,
} from "./utils";

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

describe("safeCompare", () => {
  test.each([
    ["foo", "foo"],
    ["hello world", "hello world"],
    ["你好，世界", "你好，世界"],
    ["สวัสดีชาวโลก", "สวัสดีชาวโลก"],
    ["\\u00e8", "\\u00e8"],
  ])(`should return true for %s`, (a, b) => {
    expect(safeCompare(a, b)).toBe(true);
  });

  test.each([
    ["foo", "bar"],
    ["hello world", "not hello world"],
    ["你好，世界", "您好"],
    ["สวัสดีชาวโลก", "สวัสดี"],
    ["\\u00e8", "\\u01e8"],
    ["a", "aaaaaaaaaa"],
    ["prefix", "pre"],
    ["pre", "prefix"],
  ])(`should return false for %s and %s`, (a, b) => {
    expect(safeCompare(a, b)).toBe(false);
  });
});

describe("removeTrailSlash", () => {
  it("should remove trailing slash", () => {
    expect(removeTrailingSlash("/foo/bar/")).toBe("/foo/bar");
  });

  it("should not modify strings without trailing slash", () => {
    expect(removeTrailingSlash("/foo/bar")).toBe("/foo/bar");
  });

  it("should remove only one trailing slash", () => {
    expect(removeTrailingSlash("/foo/bar//")).toBe("/foo/bar/");
  });

  it("should work with empty string", () => {
    expect(removeTrailingSlash("")).toBe("");
  });

  it("should work with undefined", () => {
    expect(removeTrailingSlash(undefined)).toBe(undefined);
  });
});
