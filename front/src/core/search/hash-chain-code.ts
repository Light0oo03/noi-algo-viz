export const HASH_CHAIN_SEARCH_CODE_JS = `function hashChainSearch(keys, target) {
  const m = pickBucketSize(keys.length);                     // 1
  const buckets = Array.from({ length: m }, () => []);       // 2
  for (const x of keys) buckets[hash(x, m)].push(x);         // 3
  const b = hash(target, m);                                  // 4
  for (let i = 0; i < buckets[b].length; i++) {              // 5
    if (buckets[b][i] === target) return { bucket: b, i };   // 6
  }
  return null;                                                // 7
}`;

export const HASH_CHAIN_SEARCH_CODE_LINES = {
  init: [1, 3] as [number, number],
  pickBucket: [4, 4] as [number, number],
  loop: [5, 5] as [number, number],
  found: [6, 6] as [number, number],
  notFound: [7, 7] as [number, number],
};
