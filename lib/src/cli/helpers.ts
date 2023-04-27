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

export const fetchDefinitions = async () => {
  const { url, token, instanceId, appName } = getDefaultConfig("cli");

  step("- Fetching feature toggle definitions");
  step("API:", url);

  if (token) {
    const environmentFromToken = token.split(".")[0].split(":").slice(-1)[0];
    step("environment:", environmentFromToken);
  }

  if (instanceId && instanceId.length > 6) {
    const censoredInstanceId =
      instanceId.slice(0, 2) +
      "*".repeat(instanceId.length - 4) +
      instanceId.slice(-2);
    step("instanceId:", censoredInstanceId);
  }

  const definitions = await getDefinitions({ url, token, instanceId, appName });

  if (!definitions || !definitions.features) {
    throw new Error(
      `${error(
        "No feature toggle definitions found in the API response"
      )}\n${JSON.stringify(definitions, null, 2)}`
    );
  }

  return definitions;
};
