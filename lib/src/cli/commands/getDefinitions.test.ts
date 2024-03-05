import { Command } from "commander";
import { getDefinitions } from "./getDefinitions";

describe("getDefinitions", () => {
  it("should expect file argument", async () => {
    const program = new Command().exitOverride();
    getDefinitions(program as any);

    expect(() =>
      program.parse(["get-definitions"], { from: "user" })
    ).toThrowErrorMatchingInlineSnapshot(
      `[CommanderError: error: missing required argument 'file']`
    );
  });
});
