import { createProgram } from "./createProgram";
import * as _helpers from "./helpers";
import { loadEnvConfig } from "@next/env";

vi.mock("./helpers");

vi.mock("@next/env", () => ({
  loadEnvConfig: vi.fn(),
}));

describe("createProgram", () => {
  const writeOut = vi.fn();
  const writeErr = vi.fn();

  const program = createProgram({
    writeOut,
    writeErr,
  })
    .exitOverride()
    .command("test", "test command");

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create a program", () => {
    expect(program).toBeDefined();
    expect(() => program.parse([])).toThrowErrorMatchingInlineSnapshot(
      `[CommanderError: (outputHelp)]`
    );
  });

  it("should display help", () => {
    expect(() =>
      program.parse(["-h"], { from: "user" })
    ).toThrowErrorMatchingInlineSnapshot(`[CommanderError: (outputHelp)]`);
    expect(writeOut.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "INTRO
      ",
        ],
        [
          "Usage: unleash [options] [command]

      Options:
        -V, --version   output the version number
        -d, --debug     output extra debugging (default: false)
        -h, --help      display help for command

      Commands:
        test            test command
        help [command]  display help for command
      ",
        ],
      ]
    `);
    expect(writeErr.mock.calls).toMatchInlineSnapshot(`[]`);
  });

  it("should display version", () => {
    expect(() =>
      program.parse(["-V"], { from: "user" })
    ).toThrowErrorMatchingInlineSnapshot(`[CommanderError: VERSION]`);
    expect(writeOut.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "VERSION
      ",
        ],
      ]
    `);
    expect(writeErr.mock.calls).toMatchInlineSnapshot(`[]`);
  });

  it("should have an ability to attach commands", () => {
    const action = vi.fn().mockReturnValueOnce("action");
    const newProgram = program
      .command("testCommand")
      .description("description")
      .action(action);

    newProgram.parse(["testCommand"], { from: "user" });
    expect(action).toHaveBeenCalled();
  });

  test("preSubcommand hook should load environment variables", async () => {
    program.command("sub").action(async () => {});
    await program.parseAsync(["sub"], { from: "user" });

    expect(vi.mocked(loadEnvConfig)).toHaveBeenCalledOnce();
    expect(vi.mocked(loadEnvConfig)).toHaveBeenCalledWith(
      process.cwd(),
      undefined,
      {
        info: expect.any(Function),
        error: expect.any(Function),
      }
    );
  });
});
