import { Command, OutputConfiguration } from "@commander-js/extra-typings";
import { loadEnvConfig } from "@next/env";
import { error, intro, version } from "./helpers";

export const createProgram = (
  output: OutputConfiguration = {
    outputError: (str, write) => write(error(str)),
  }
) => {
  const program = new Command()
    .name("unleash")
    .version(version)
    .option(
      "-d, --debug",
      "output extra debugging",
      process.env.DEBUG === "true"
    )
    .showHelpAfterError()
    .configureOutput(output)
    .addHelpText("before", intro);

  program.hook("preSubcommand", async () => {
    const options = program.opts();
    await loadEnvConfig(process.cwd(), undefined, {
      info: (...msg: string[]) => {
        if (options.debug) {
          console.debug(...msg);
        }
      },
      error: (...msg) => {
        program.error(msg.join(" "));
      },
    });
  });

  return program;
};
