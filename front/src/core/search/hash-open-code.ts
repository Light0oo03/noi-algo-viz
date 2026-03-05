export const HASH_OPEN_SEARCH_CODE_JS = `function hashOpenSearch(keys, target) {
  const m = pickTableSize(keys.length);                    // 1
  const table = Array(m).fill(-1);                         // 2
  for (const x of keys) insertLinearProbing(table, x);     // 3
  let idx = hash(target, m), step = 0;                     // 4
  while (step < m && table[idx] !== -1) {                  // 5
    if (table[idx] === target) return idx;                 // 6
    idx = (idx + 1) % m;                                   // 7
    step++;                                                // 8
  }
  return -1;                                               // 9
}`;

export const HASH_OPEN_SEARCH_CODE_LINES = {
  init: [1, 4] as [number, number],
  loop: [5, 5] as [number, number],
  found: [6, 6] as [number, number],
  probe: [7, 8] as [number, number],
  notFound: [9, 9] as [number, number],
};
