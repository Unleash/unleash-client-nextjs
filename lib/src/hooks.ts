"use client";

import { IToggle, type IVariant } from "unleash-proxy-client";
import {
  useFlag as useFlagOriginal,
  useVariant as useVariantOriginal,
  useFlags as useFlagsOriginal,
  useFlagsStatus as useFlagsStatusOriginal,
  useUnleashContext as useUnleashContextOriginal,
  useUnleashClient as useUnleashClientOriginal,
} from "@unleash/proxy-client-react";

export const useFlag = <T extends string>(name: T) => useFlagOriginal(name);
export const useVariant = <T extends string, V extends Partial<IVariant>>(
  name: T
): V => useVariantOriginal(name) as any;
export const useFlags = <T extends IToggle[]>() => useFlagsOriginal() as T;
export const useFlagsStatus = useFlagsStatusOriginal;
export const useUnleashContext = useUnleashContextOriginal;
export const useUnleashClient = useUnleashClientOriginal;
