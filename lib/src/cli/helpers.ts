import * as path from "node:path";
import { readFileSync } from "node:fs";
import { getDefaultConfig, getDefinitions } from "../getDefinitions";

const c1 = "\u001b[38;2;26;64;73m"; // #1a4049
const c2 = "\u001b[38;2;129;122;254m"; // #817afe
const c4 = "\u001b[38;2;234;169;157m"; // #eaa99d
const b = "\u001b[1m";
const r = "\u001b[39m\u001b[22m";

export const intro = `${c1}
█ ${b}Unleash CLI
${r}`;

export const version = JSON.parse(
  readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf-8")
).version;

export const step = (message: string, ...params: string[]) => {
  if (params.length) {
    console.log(
      `${c1}  ${message}${params
        .map((param) => ` ${c2}${param}${r}`)
        .join(", ")}`
    );
  } else {
    console.log(message);
  }
};

export const error = (message: string) => [c4, message, r].join("");

export const typedExports = {
  imports: `import {
  type IToggle,
  useFlag as useFlagOriginal,
  useVariant as useVariantOriginal,
  useFlags as useFlagsOriginal,
  flagsClient as flagsClientOriginal,
} from "@unleash/nextjs";`,
  body: `
export const useFlag = useFlagOriginal<FeatureName>;
export const useVariant = <T extends FeatureName>(name: T) =>
  useVariantOriginal<T, FeatureVariants[T][number]>(name);
export const useFlags = useFlagsOriginal<Features>;
export const flagsClient = (toggles: IToggle[]) => {
  const output = flagsClientOriginal(toggles);
  return {
    isEnabled: (name: FeatureName) => output.isEnabled(name),
    getVariant: <T extends FeatureName>(name: T) =>
      output.getVariant(name) as FeatureVariants[T][number],
  };
};
`,
};

export const fetchDefinitions = async () => {
  const defaultConfig = getDefaultConfig("cli");
  const url = process.env.UNLEASH_URL || defaultConfig.url;
  const token = process.env.UNLEASH_TOKEN || defaultConfig.token;
  const appName = process.env.UNLEASH_APPNAME || defaultConfig.appName;

  step("- Fetching feature toggle definitions");
  step("API:", url);
  step("environment:", token.split(".")[0].split(":").slice(-1)[0]);
  return getDefinitions({
    url,
    token,
    appName,
  });
};
