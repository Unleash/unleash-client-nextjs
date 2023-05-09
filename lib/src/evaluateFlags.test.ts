import { evaluateFlags } from "./evaluateFlags";
import clientSpecification from "@unleash/client-specification/specifications/index.json";
import { flagsClient } from "./flagsClient";

const files = clientSpecification.map((file) =>
  require(`@unleash/client-specification/specifications/${file}`)
);

describe.each(files)(
  "evaluateFlags - $name",
  ({ state, tests, variantTests }) => {
    if (tests) {
      test.each(
        tests as Array<{
          description: string;
          context: any;
          toggleName: string;
          expectedResult: boolean;
        }>
      )("$description", ({ context, toggleName, expectedResult }) => {
        const { toggles } = evaluateFlags(state, context);
        const result = flagsClient(toggles).isEnabled(toggleName);
        expect(result).toStrictEqual(expectedResult);
      });
    }

    if (variantTests) {
      test.each(
        variantTests as Array<{
          description: string;
          context: any;
          toggleName: string;
          expectedResult: any;
        }>
      )("$description", ({ context, toggleName, expectedResult }) => {
        const { toggles } = evaluateFlags(state, context);
        const result = flagsClient(toggles).getVariant(toggleName);
        expect(result).toStrictEqual(expectedResult);
      });
    }
  }
);
