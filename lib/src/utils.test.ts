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
        UNLEASH_SERVER_API_URL: "http://example.com/api",
      },
    });

    expect(getDefaultClientConfig()).toEqual({
      url: "http://example.com/api/frontend",
      appName: "nextjs",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });
  });

  it("should use set appName", () => {
    vi.stubGlobal("process", {
      env: {
        NEXT_PUBLIC_UNLEASH_APP_NAME: "my-app",
      },
    });

    expect(getDefaultClientConfig()).toEqual({
      url: "http://localhost:4242/api/frontend",
      appName: "my-app",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });

    vi.stubGlobal("process", {
      env: {
        NEXT_PUBLIC_UNLEASH_APP_NAME: "my-app",
        UNLEASH_APP_NAME: "my-app-override",
      },
    });

    expect(getDefaultClientConfig()).toEqual({
      url: "http://localhost:4242/api/frontend",
      appName: "my-app-override",
      clientKey: "default:development.unleash-insecure-frontend-api-token",
    });
  });
});

// UNLEASH_SERVER_API_URL
// UNLEASH_FRONTEND_API_URL
// UNLEASH_SERVER_API_TOKEN
// UNLEASH_FRONTEND_API_TOKEN
// UNLEASH_APP_NAME

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
