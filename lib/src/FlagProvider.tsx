"use client";

import type { ComponentProps, FC, ReactNode } from "react";
import { FlagProvider as ReactFlagProvider } from "@unleash/proxy-client-react";
import { getDefaultClientConfig } from "./utils";

type Config = Required<ComponentProps<typeof ReactFlagProvider>>["config"];

type FlagProviderProps = {
  children: ReactNode;
  config?: Partial<Config>;
} & Omit<ComponentProps<typeof ReactFlagProvider>, "config">;

export const FlagProvider: FC<FlagProviderProps> = ({ children, ...props }) => (
  <ReactFlagProvider
    {...props}
    startClient={
      props.startClient !== undefined
        ? props.startClient
        : typeof window !== "undefined"
    }
    config={{
      ...getDefaultClientConfig(),
      ...props.config,
    }}
  >
    {children}
  </ReactFlagProvider>
);
