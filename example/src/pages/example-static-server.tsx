import {
  clientFlags,
  evaluateFlags,
  getDefinitions,
  type IVariant,
} from "@unleash/nextjs";
import type { GetStaticProps, NextPage } from "next";

type Props = {
  isEnabled: boolean;
  variant: IVariant;
};

const ExampleStaticPage: NextPage<Props> = ({ isEnabled, variant }) => (
  <>
    Flag status: {isEnabled ? "ENABLED" : "DISABLED"}
    <br />
    Variant: {variant.name}
  </>
);

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const context = {}; // you can populate it from user cookie etc.

  const definitions = await getDefinitions();
  const { toggles } = evaluateFlags(definitions, context);
  const flags = clientFlags(toggles);

  return {
    props: {
      isEnabled: flags.isEnabled("nextjs-poc"),
      variant: flags.getVariant("nextjs-poc"),
    },
  };
};

export default ExampleStaticPage;
