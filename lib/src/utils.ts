/**
 * Do a constant time string comparison. Always compare the complete strings
 * against each other to get a constant time. This method does not short-cut
 * if the two string's length differs.
 *
 * @see https://github.com/Bruce17/safe-compare/blob/a96e0fb1dd1b6e998f657b43987c5b7a6d48186e/index.js#L12-L38
 */
export const safeCompare = function safeCompare(a: string, b: string) {
  let strA = String(a);
  let strB = String(b);
  const lenA = strA.length;
  let result = 0;

  if (lenA !== strB.length) {
    strB = strA;
    result = 1;
  }

  for (let i = 0; i < lenA; i++) {
    result |= strA.charCodeAt(i) ^ strB.charCodeAt(i);
  }

  return result === 0;
};

export const randomSessionId = () =>
  `${Math.floor(Math.random() * 1_000_000_000)}`;

const validateEnviromentVariables = () => {
  if (process.env.NEXT_PUBLIC_UNLEASH_SERVER_API_TOKEN) {
    console.warn(
      "You are trying to set `NEXT_PUBLIC_UNLEASH_SERVER_API_TOKEN`. Server keys shouldn't be public. Use frontend keys or skip `NEXT_PUBLIC_ prefix."
    );
  }
};

const getFrontendUrl = () =>
  process.env.UNLEASH_FRONTEND_API_URL ||
  process.env.NEXT_PUBLIC_UNLEASH_FRONTEND_API_URL;

const getServerBaseUrl = () =>
  process.env.UNLEASH_SERVER_API_URL ||
  process.env.NEXT_PUBLIC_UNLEASH_SERVER_API_URL;

export const getDefaultClientConfig = () => {
  validateEnviromentVariables();

  return {
    url:
      getFrontendUrl() ||
      `${getServerBaseUrl() || "http://localhost:4242/api"}/frontend`,
    appName:
      process.env.UNLEASH_APP_NAME ||
      process.env.NEXT_PUBLIC_UNLEASH_APP_NAME ||
      "nextjs",
    clientKey:
      process.env.UNLEASH_FRONTEND_API_TOKEN ||
      process.env.NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN ||
      "default:development.unleash-insecure-frontend-api-token",
  };
};

export const removeTrailingSlash = (url?: string) =>
  url && url.replace(/\/$/, "");
