export const EXPONENTIAL_SEARCH_CODE_JS = `function exponentialSearch(nums, target) {
  if (nums.length === 0) return -1;                      // 1
  if (nums[0] === target) return 0;                      // 2
  let bound = 1;                                          // 3
  while (bound < nums.length && nums[bound] < target) {  // 4
    bound *= 2;                                           // 5
  }
  let left = Math.floor(bound / 2);                       // 6
  let right = Math.min(bound, nums.length - 1);           // 7
  while (left <= right) {                                 // 8
    const mid = Math.floor((left + right) / 2);           // 9
    if (nums[mid] === target) return mid;                 // 10
    if (nums[mid] < target) left = mid + 1;               // 11
    else right = mid - 1;                                 // 12
  }
  return -1;                                              // 13
}`;

export const EXPONENTIAL_SEARCH_CODE_LINES = {
  empty: [1, 1] as [number, number],
  first: [2, 2] as [number, number],
  init: [3, 3] as [number, number],
  rangeLoop: [4, 4] as [number, number],
  rangeGrow: [5, 5] as [number, number],
  initBinary: [6, 7] as [number, number],
  loop: [8, 8] as [number, number],
  mid: [9, 9] as [number, number],
  found: [10, 10] as [number, number],
  moveLow: [11, 11] as [number, number],
  moveHigh: [12, 12] as [number, number],
  notFound: [13, 13] as [number, number],
};
