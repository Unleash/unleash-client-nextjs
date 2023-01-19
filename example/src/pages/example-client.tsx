import { useFlag } from "@unleash/nextjs";
import type { NextPage } from "next";

const ExamplePage: NextPage = () => {
  const isEnabled = useFlag("snowing");

  return <>{isEnabled ? "ENABLED" : "DISABLED"}</>;
};

export default ExamplePage;
