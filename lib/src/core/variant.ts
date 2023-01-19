import type { Context } from "unleash-client/lib";
import type { FeatureInterface } from "unleash-client/lib/feature";
import { resolveContextValue } from "unleash-client/lib/helpers";
import type { Variant, VariantDefinition } from "unleash-client/lib/variant";
import normalizedValue from "./hash";

interface IOverride {
  contextName: string;
  values: string[];
}

export function getDefaultVariant(): Variant {
  return {
    name: "disabled",
    enabled: false,
  };
}

function randomString() {
  return String(Math.round(Math.random() * 100000));
}

const stickinessSelectors = ["userId", "sessionId", "remoteAddress"];
function getSeed(context: Context, stickiness = "default"): string {
  if (stickiness !== "default") {
    const value = resolveContextValue(context, stickiness);
    return value ? value.toString() : randomString();
  }
  let result;
  stickinessSelectors.some((key: string): boolean => {
    const value = context[key];
    if (typeof value === "string" && value !== "") {
      result = value;
      return true;
    }
    return false;
  });
  return result || randomString();
}

function overrideMatchesContext(context: Context): (o: IOverride) => boolean {
  return (o: IOverride) =>
    o.values.some(
      (value) => value === resolveContextValue(context, o.contextName)
    );
}

function findOverride(
  feature: FeatureInterface,
  context: Context
): VariantDefinition | undefined {
  return feature.variants
    .filter((variant) => variant.overrides)
    .find((variant) => variant.overrides.some(overrideMatchesContext(context)));
}

export function selectVariant(
  feature: FeatureInterface,
  context: Context
): VariantDefinition | null {
  const totalWeight = feature.variants.reduce((acc, v) => acc + v.weight, 0);
  if (totalWeight <= 0) {
    return null;
  }
  const variantOverride = findOverride(feature, context);
  if (variantOverride) {
    return variantOverride;
  }

  const { stickiness } = feature.variants[0];

  const target = normalizedValue(
    getSeed(context, stickiness),
    feature.name,
    totalWeight
  );

  let counter = 0;
  const variant = feature.variants.find(
    (v: VariantDefinition): VariantDefinition | undefined => {
      if (v.weight === 0) {
        return undefined;
      }
      counter += v.weight;
      if (counter < target) {
        return undefined;
      }
      return v;
    }
  );
  return variant || null;
}
