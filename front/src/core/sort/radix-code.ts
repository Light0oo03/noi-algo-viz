export const RADIX_SORT_CODE_JS = `function radixSort(nums) {
  const maxVal = Math.max(...nums);                           // 1
  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) { // 2
    const buckets = Array.from({ length: 10 }, () => []);      // 3
    for (const x of nums) {                                     // 4
      const digit = Math.floor(x / exp) % 10;                   // 5
      buckets[digit].push(x);                                   // 6
    }
    nums = [].concat(...buckets);                               // 7
  }
  return nums;                                                   // 8
}`;

export const RADIX_SORT_CODE_LINES = {
  max: [1, 1] as [number, number],
  expLoop: [2, 2] as [number, number],
  bucketInit: [3, 3] as [number, number],
  scan: [4, 5] as [number, number],
  push: [6, 6] as [number, number],
  flatten: [7, 7] as [number, number],
  done: [8, 8] as [number, number],
};
