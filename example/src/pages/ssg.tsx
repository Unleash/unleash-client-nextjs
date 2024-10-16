import { flagsClient, getFrontendFlags, type IVariant } from "@unleash/nextjs";
import type { GetStaticProps, NextPage } from "next";

type Data = {
  isEnabled: boolean;
  variant: IVariant;
};

const ExampleStaticPage: NextPage<Data> = ({ isEnabled, variant }) => (
  <>
    Flag status: {isEnabled ? "ENABLED" : "DISABLED"}
    <br />
    Variant: {variant.name}
  </>
);

export const getStaticProps: GetStaticProps<Data> = async (_ctx) => {
  const { toggles } = await getFrontendFlags();
  const flags = flagsClient(toggles);

  return {
    props: {
      isEnabled: flags.isEnabled("example-flag"),
      variant: flags.getVariant("example-flag"),
    },
  };
};

export default ExampleStaticPage;
