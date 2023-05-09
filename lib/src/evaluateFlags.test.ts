import { evaluateFlags } from "./evaluateFlags";
import clientSpecification from "@unleash/client-specification/specifications/index.json";

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
        const toggle = toggles.find((toggle) => toggle.name === toggleName);
        expect(!!toggle?.enabled).toBe(expectedResult);
      });
    }

    if (variantTests) {
      test.each(
        variantTests as Array<{
          description: string;
          context: any;
          toggleName: string;
          expectedResult: string;
        }>
      )("$description", ({ context, toggleName, expectedResult }) => {
        const { toggles } = evaluateFlags(state, context);
        const toggle = toggles.find((toggle) => toggle.name === toggleName);
        expect(toggle?.variant).toStrictEqual(expectedResult);
      });
    }
  }
);
