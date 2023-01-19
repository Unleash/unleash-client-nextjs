import { clientFlags, getFrontendFlags, type IVariant } from "@unleash/nextjs";
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

export const getStaticProps: GetStaticProps<Props> = async (_ctx) => {
  const { toggles } = await getFrontendFlags();
  const flags = clientFlags(toggles);

  return {
    props: {
      isEnabled: flags.isEnabled("snowing"),
      variant: flags.getVariant("snowing"),
    },
  };
};

export default ExampleStaticPage;
