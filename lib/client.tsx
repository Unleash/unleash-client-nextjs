"use client";

import React, { ComponentProps, FC } from "react";
import { IToggle, type IVariant } from "unleash-proxy-client";
import {
  FlagProvider as ReactFlagProvider,
  useFlag as useFlagOriginal,
  useVariant as useVariantOriginal,
  useFlags as useFlagsOriginal,
  useFlagsStatus as useFlagsStatusOriginal,
} from "@unleash/proxy-client-react";

const getFrontendUrl = () =>
  process.env.UNLEASH_FRONTEND_API_URL ||
  process.env.NEXT_PUBLIC_UNLEASH_FRONTEND_API_URL;

const getServerBaseUrl = () =>
  process.env.UNLEASH_SERVER_API_URL ||
  process.env.NEXT_PUBLIC_UNLEASH_SERVER_API_URL;

const validateEnviromentVariables = () => {
  if (process.env.NEXT_PUBLIC_UNLEASH_SERVER_API_TOKEN) {
    console.warn(
      "You are trying to set `NEXT_PUBLIC_UNLEASH_SERVER_API_TOKEN`. Server keys shouldn't be public. Use frontend keys or skip `NEXT_PUBLIC_ prefix."
    );
  }
};

export const getDefaultClientConfig = () => {
  validateEnviromentVariables();

  return {
    url:
      getFrontendUrl() ||
      `${getServerBaseUrl() || "http://localhost:4242/api"}/frontend`,
    appName:
      process.env.UNLEASH_APP_NAME ||
      process.env.NEXT_PUBLIC_UNLEASH_APP_NAME ||
      "nextjs",
    clientKey:
      process.env.UNLEASH_FRONTEND_API_TOKEN ||
      process.env.NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN ||
      "default:development.unleash-insecure-frontend-api-token",
  };
};

type Config = Required<ComponentProps<typeof ReactFlagProvider>>["config"];

type FlagProviderProps = {
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
export const useFlag = <T extends string>(name: T) => useFlagOriginal(name);
export const useVariant = <T extends string, V extends Partial<IVariant>>(
  name: T
): V => useVariantOriginal(name) as any;
export const useFlags = <T extends IToggle[]>() => useFlagsOriginal() as T;
export const useFlagsStatus = useFlagsStatusOriginal;
