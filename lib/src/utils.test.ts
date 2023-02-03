import { getDefaultClientConfig } from "./utils";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("getDefaultClientConfig", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return the default config", () => {
    vi.stubGlobal("process", {
      env: {},
    });
    expect(getDefaultClientConfig()).toEqual({
      url: "http://localhost:4242/api/frontend",
      appName: "nextjs",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });
  });

  it("should use BASE_URL", () => {
    vi.stubGlobal("process", {
      env: {
        UNLEASH_BASE_URL: "http://example.com/api",
      },
    });

    expect(getDefaultClientConfig()).toEqual({
      url: "http://example.com/api/frontend",
      appName: "nextjs",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });
  });
});
