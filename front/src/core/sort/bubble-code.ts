export const BUBBLE_SORT_CODE_JS = `function bubbleSort(nums) {
  for (let i = 0; i < nums.length - 1; i++) {      // 1
    for (let j = 0; j < nums.length - 1 - i; j++) { // 2
      if (nums[j] > nums[j + 1]) {                  // 3
        [nums[j], nums[j + 1]] = [nums[j + 1], nums[j]]; // 4
      }
    }
  }
  return nums;                                      // 5
}`;

export const BUBBLE_SORT_CODE_LINES = {
  outer: [1, 1] as [number, number],
  inner: [2, 2] as [number, number],
  compare: [3, 3] as [number, number],
  swap: [4, 4] as [number, number],
  done: [5, 5] as [number, number],
};
