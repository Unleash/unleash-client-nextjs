import * as fs from "node:fs/promises";
import { fetchDefinitions, step } from "../helpers";
import type { Command } from "@commander-js/extra-typings";

export const getDefinitions = (program: Command) => {
  program
    .command("get-definitions")
    .description(
      "Download feature flags definitions for bootstrapping (offline use) of server-side SDK."
    )
    .argument(
      "<file>",
      "output file name (e.g. `./generated/feature-flag-definitions.json`)"
    )
    .action(async (file) => {
      const definitions = await fetchDefinitions();
      step("- Saving definitions to file");
      await fs.writeFile(file, JSON.stringify(definitions, null, 2));
      step("output:", file);
    });

  return program;
};
