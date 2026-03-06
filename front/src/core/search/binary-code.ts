export const BINARY_SEARCH_CODE_JS = `function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;         // 1
  while (left <= right) {                         // 2
    const mid = Math.floor((left + right) / 2);  // 3
    if (nums[mid] === target) return mid;         // 4
    if (nums[mid] < target) left = mid + 1;       // 5
    else right = mid - 1;                         // 6
  }
  return -1;                                      // 7
}`;

export const BINARY_SEARCH_CODE_LINES = {
  init: [1, 1] as [number, number],
  loop: [2, 2] as [number, number],
  mid: [3, 3] as [number, number],
  found: [4, 4] as [number, number],
  moveLeft: [5, 5] as [number, number],
  moveRight: [6, 6] as [number, number],
  notFound: [7, 7] as [number, number],
};
