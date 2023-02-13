import { Command } from "commander";
import { generateTypes } from "./generateTypes";

describe("generateTypes", () => {
  it("should expect file argument", async () => {
    const program = new Command().exitOverride();
    generateTypes(program as any);

    expect(() =>
      program.parse(["generate-types"], { from: "user" })
    ).toThrowErrorMatchingInlineSnapshot(
      "\"error: missing required argument 'file'\""
    );
  });
});
