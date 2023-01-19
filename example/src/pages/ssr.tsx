import {
  clientFlags,
  evaluateFlags,
  getDefinitions,
  type IVariant,
} from "@unleash/nextjs";
import type { GetServerSideProps, NextPage } from "next";

const COOKIE_NAME = "unleash-session-id";

type Data = {
  isEnabled: boolean;
  variant: IVariant;
};

const ServerSideRenderedPage: NextPage<Data> = ({ isEnabled, variant }) => (
  <>
    Flag status: {isEnabled ? "ENABLED" : "DISABLED"}
    <br />
    Variant: {variant.name}
  </>
);

export const getServerSideProps: GetServerSideProps<Data> = async (ctx) => {
  const sessionId =
    ctx.req.cookies[COOKIE_NAME] ||
    `${Math.floor(Math.random() * 1_000_000_000)}`;

  const context = {
    sessionId,
  };

  const definitions = await getDefinitions();
  const { toggles } = evaluateFlags(definitions, context);
  const flags = clientFlags(toggles);

  ctx.res.setHeader("set-cookie", `${COOKIE_NAME}=${sessionId}; path=/;`);

  return {
    props: {
      isEnabled: flags.isEnabled("nextjs-poc"),
      variant: flags.getVariant("nextjs-poc"),
    },
  };
};

export default ServerSideRenderedPage;
