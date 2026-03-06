export const QUICK_SORT_CODE_JS = `function quickSort(nums, left = 0, right = nums.length - 1) {
  if (left >= right) return nums;                       // 1
  const pivot = nums[right];                            // 2
  let i = left - 1;                                     // 3
  for (let j = left; j < right; j++) {                  // 4
    if (nums[j] <= pivot) {                             // 5
      i++;                                              // 6
      [nums[i], nums[j]] = [nums[j], nums[i]];         // 7
    }
  }
  [nums[i + 1], nums[right]] = [nums[right], nums[i + 1]]; // 8
  const p = i + 1;                                      // 9
  quickSort(nums, left, p - 1);                         // 10
  quickSort(nums, p + 1, right);                        // 11
  return nums;                                          // 12
}`;

export const QUICK_SORT_CODE_LINES = {
  base: [1, 1] as [number, number],
  pivot: [2, 3] as [number, number],
  loop: [4, 4] as [number, number],
  compare: [5, 5] as [number, number],
  moveI: [6, 6] as [number, number],
  swap: [7, 7] as [number, number],
  pivotSwap: [8, 9] as [number, number],
  recurseLeft: [10, 10] as [number, number],
  recurseRight: [11, 11] as [number, number],
  done: [12, 12] as [number, number],
};
