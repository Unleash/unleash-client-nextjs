import { ComponentProps, FC } from "react";
import { FlagProvider as ReactFlagProvider } from "@unleash/proxy-client-react";
import { defaultClientConfig } from "./utils";

type Config = Required<ComponentProps<typeof ReactFlagProvider>>["config"];

type FlagProviderProps = {
  config?: Partial<Config>;
} & Omit<ComponentProps<typeof ReactFlagProvider>, "config">;

export const FlagProvider: FC<FlagProviderProps> = ({ ...props }) => (
  <ReactFlagProvider
    {...props}
    startClient={
      props.startClient !== undefined
        ? props.startClient
        : typeof window !== "undefined"
    }
    config={{
      ...defaultClientConfig,
      ...props.config,
    }}
  />
);
