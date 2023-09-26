import clientSpecification from "@unleash/client-specification/specifications/index.json";
import { evaluateFlags } from "./evaluateFlags";
import { flagsClient } from "./flagsClient";

const files = clientSpecification.map((file) =>
  require(`@unleash/client-specification/specifications/${file}`)
) as Array<{
  state: any;
  tests?: Array<{
    description: string;
    context: any;
    toggleName: string;
    expectedResult: boolean;
  }>;
  variantTests?: Array<{
    description: string;
    context: any;
    toggleName: string;
    expectedResult: any;
  }>;
}>;

// Test `evaluateFlags` and `flagsClient` together
// using @unleash/client-specification
describe.each(files)("$name", ({ state, tests, variantTests }) => {
  beforeAll(() => {
    vi.stubGlobal("console", { warn: vi.fn(), error: vi.fn() });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  if (tests) {
    test.each(tests)(
      "$description",
      ({ context, toggleName, expectedResult }) => {
        const { toggles } = evaluateFlags(state, context);
        const result = flagsClient(toggles).isEnabled(toggleName);
        expect(result).toBe(expectedResult);
      }
    );
  }

  if (variantTests) {
    test.each(variantTests)(
      "$description",
      ({ context, toggleName, expectedResult }) => {
        const { toggles } = evaluateFlags(state, context);
        const result = flagsClient(toggles).getVariant(toggleName);
        expect(result).toStrictEqual(expectedResult);
      }
    );
  }
});
