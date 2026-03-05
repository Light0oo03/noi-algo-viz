export const INTERPOLATION_SEARCH_CODE_JS = `function interpolationSearch(nums, target) {
  let low = 0, high = nums.length - 1;                   // 1
  while (low <= high && target >= nums[low] && target <= nums[high]) { // 2
    if (low === high) return nums[low] === target ? low : -1; // 3
    const pos = low + Math.floor(((target - nums[low]) * (high - low)) / (nums[high] - nums[low])); // 4
    if (nums[pos] === target) return pos;                // 5
    if (nums[pos] < target) low = pos + 1;               // 6
    else high = pos - 1;                                 // 7
  }
  return -1;                                             // 8
}`;

export const INTERPOLATION_SEARCH_CODE_LINES = {
  init: [1, 1] as [number, number],
  loop: [2, 2] as [number, number],
  edge: [3, 3] as [number, number],
  pos: [4, 4] as [number, number],
  found: [5, 5] as [number, number],
  moveLow: [6, 6] as [number, number],
  moveHigh: [7, 7] as [number, number],
  notFound: [8, 8] as [number, number],
};
