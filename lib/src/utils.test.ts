import { getDefaultClientConfig } from "./utils";

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

// export const getDefaultClientConfig = {
//   url: `${
//     process.env.UNLEASH_BASE_URL ||
//     process.env.NEXT_PUBLIC_UNLEASH_BASE_URL ||
//     "http://localhost:4242/api"
//   }/frontend`,
//   appName:
//     process.env.UNLEASH_APP_NAME ||
//     process.env.NEXT_PUBLIC_UNLEASH_APP_NAME ||
//     "nextjs",
//   clientKey:
//     process.env.UNLEASH_FRONTEND_API_TOKEN ||
//     process.env.NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN ||
//     "default:development.unleash-insecure-frontend-api-token",
// };
