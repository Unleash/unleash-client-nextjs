import { selectVariant, type Variant } from "unleash-client/lib/variant";
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

  // *yieldSegmentConstraints(
  //   segments: (Segment | undefined)[]
  // ): IterableIterator<Constraint | undefined> {
  //   for (const segment of segments) {
  //     if (segment) {
  //       for (const constraint of segment.constraints) {
  //         yield constraint;
  //       }
  //     } else {
  //       yield undefined;
  //     }
  //   }
  // }

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

  getVariant(name: string, context: Context): Variant {
    const feature = this.features.get(name);

    if (
      !feature ||
      !feature.variants ||
      !Array.isArray(feature.variants) ||
      feature.variants.length === 0
    ) {
      return getDefaultVariant();
    }

    const enabled = this.isEnabled(name, context);
    if (!enabled) {
      return getDefaultVariant();
    }

    const variant = selectVariant(feature, context);
    if (!variant) {
      return getDefaultVariant();
    }

    return { name: variant.name, payload: variant.payload, enabled };
  }

  isEnabled(featureName: string, context: Context): boolean {
    const feature = this.features.get(featureName);
    if (!feature || !feature.enabled) {
      return false;
    }

    if (!Array.isArray(feature.strategies)) {
      return false;
    }

    if (feature.strategies.length === 0) {
      return feature.enabled;
    }

    return (
      feature.strategies.length > 0 &&
      feature.strategies.some((strategySelector): boolean => {
        const strategy = this.getStrategy(strategySelector.name);
        if (!strategy) {
          return false;
        }
        const constraints = this.yieldConstraintsFor(strategySelector);
        return strategy.isEnabledWithConstraints(
          strategySelector.parameters,
          context,
          constraints
        );
      })
    );
  }
}
