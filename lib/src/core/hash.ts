import * as murmurHash3 from 'murmurhash3js';

export default function normalizedValue(
  id: string,
  groupId: string,
  normalizer = 100,
  seed = 0
): number {
  return (murmurHash3.x86.hash32(`${groupId}:${id}`, seed) % normalizer) + 1;
}
