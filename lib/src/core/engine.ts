import { selectVariant } from "./variant";
import type { Variant } from "unleash-client/lib/variant";
import type { Context } from "unleash-client/lib/context";
import type { Constraint, Segment } from "unleash-client/lib/strategy/strategy";
import type {
  ClientFeaturesResponse,
  FeatureInterface,
} from "unleash-client/lib/feature";
import {
  defaultStrategies,
  type Strategy,
  type StrategyTransportInterface,
} from "./client/strategy";
import { getDefaultVariant } from "./variant";

function processFeatures(
  rawFeatures?: ClientFeaturesResponse
): Map<string, FeatureInterface> {
  const processedFeatures = new Map<string, FeatureInterface>();

  if (rawFeatures) {
    rawFeatures.features.forEach((feature) => {
      processedFeatures.set(feature.name, feature);
    });
  }
  return processedFeatures;
}

function processSegments(
  rawFeatures?: ClientFeaturesResponse
): Map<number, Segment> {
  const processedSegments = new Map<number, Segment>();
  if (rawFeatures && rawFeatures.segments) {
    rawFeatures.segments.forEach((segment) => {
      processedSegments.set(segment.id, segment);
    });
  }
  return processedSegments;
}

export class ToggleEngine {
  features: Map<string, FeatureInterface>;

  strategies: Strategy[];

  segments: Map<number, Segment>;

  constructor(rawFeatures: ClientFeaturesResponse) {
    this.features = processFeatures(rawFeatures);
    this.strategies = [...defaultStrategies];
    this.segments = processSegments(rawFeatures);
  }

  private getStrategy(name: string): Strategy | undefined {
    return this.strategies.find(
      (strategy: Strategy): boolean => strategy.name === name
    );
  }

  *yieldConstraintsFor(
    strategy: StrategyTransportInterface
  ): IterableIterator<Constraint | undefined> {
    if (strategy.constraints) {
      yield* strategy.constraints;
    }
    const segments = strategy.segments?.map((segmentId) =>
      this.segments.get(segmentId)
    );
    if (!segments) {
      return;
    }
    yield* this.yieldSegmentConstraints(segments);
  }

  yieldSegmentConstraints(segments: (Segment | undefined)[]) {
    let constraints: Array<Constraint | undefined> = [];
    for (const segment of segments) {
      if (segment) {
        constraints = constraints.concat(segment.constraints);
      } else {
        constraints.push(undefined);
      }
    }
    return constraints;
  }

  getValue(name: string, context: Context): Variant | undefined {
    let strategyVariant: Variant | undefined = undefined;

    const feature = this.features.get(name);

    if (!feature?.enabled) {
      return undefined;
    }

    const hasEnabledStrategy = feature?.strategies?.some(
      (strategySelector): boolean => {
        const strategy = this.getStrategy(strategySelector.name);
        if (!strategy) {
          return false;
        }
        const constraints = this.yieldConstraintsFor(strategySelector);
        const result = strategy.getResult(
          strategySelector.parameters,
          context,
          constraints,
          strategySelector.variants
        );

        if (result.enabled) {
          strategyVariant = result.variant;
          return true;
        }
        return false;
      }
    );
    if (strategyVariant) {
      return strategyVariant;
    }

    if (
      (feature?.strategies?.length === 0 || hasEnabledStrategy) &&
      feature?.variants
    ) {
      const featureVariant = selectVariant(feature, context);
      if (featureVariant) {
        return {
          name: featureVariant.name,
          payload: featureVariant.payload,
          enabled: true,
        };
      }
    }

    if (hasEnabledStrategy || !feature?.strategies?.length) {
      return getDefaultVariant();
    }

    return undefined;
  }
}
