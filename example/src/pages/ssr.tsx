import {
  flagsClient,
  evaluateFlags,
  getDefinitions,
  type IVariant,
} from "@unleash/nextjs";
import type { GetServerSideProps, NextPage } from "next";

const COOKIE_NAME = "unleash-session-id";

type Data = {
  isEnabled: boolean;
  variant: IVariant;
  percent: number;
};

const ServerSideRenderedPage: NextPage<Data> = ({
  isEnabled,
  variant,
  percent,
}) => (
  <>
    Flag status: {isEnabled ? "ENABLED" : "DISABLED"}
    <br />
    Variant: {variant.name}
    <br />
    How many feature toggles are enabled: {percent}%
  </>
);

export const getServerSideProps: GetServerSideProps<Data> = async (ctx) => {
  const sessionId =
    ctx.req.cookies[COOKIE_NAME] ||
    `${Math.floor(Math.random() * 1_000_000_000)}`;
  ctx.res.setHeader("set-cookie", `${COOKIE_NAME}=${sessionId}; path=/;`);

  const definitions = await getDefinitions();
  const { toggles } = evaluateFlags(definitions, {
    sessionId,
  });
  const flags = flagsClient(toggles);

  return {
    props: {
      isEnabled: flags.isEnabled("nextjs-poc"),
      variant: flags.getVariant("nextjs-poc"),
      percent: (toggles.length / definitions.features.length) * 100,
    },
  };
};

export default ServerSideRenderedPage;