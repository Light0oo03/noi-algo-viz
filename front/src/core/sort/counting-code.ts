export const COUNTING_SORT_CODE_JS = `function countingSort(nums) {
  const maxVal = Math.max(...nums);                        // 1
  const cnt = Array(maxVal + 1).fill(0);                   // 2
  for (const x of nums) cnt[x]++;                          // 3
  let idx = 0;                                              // 4
  for (let v = 0; v <= maxVal; v++) {                      // 5
    while (cnt[v] > 0) {                                   // 6
      nums[idx++] = v;                                     // 7
      cnt[v]--;                                            // 8
    }
  }
  return nums;                                              // 9
}`;

export const COUNTING_SORT_CODE_LINES = {
  max: [1, 2] as [number, number],
  count: [3, 3] as [number, number],
  init: [4, 4] as [number, number],
  valueLoop: [5, 5] as [number, number],
  writeLoop: [6, 6] as [number, number],
  write: [7, 8] as [number, number],
  done: [9, 9] as [number, number],
};
