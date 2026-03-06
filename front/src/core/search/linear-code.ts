export const LINEAR_SEARCH_CODE_JS = `function linearSearch(nums, target) {
  for (let i = 0; i < nums.length; i++) {   // 1
    if (nums[i] === target) {                // 2
      return i;                              // 3
    }
  }
  return -1;                                 // 4
}`;

export const LINEAR_SEARCH_CODE_LINES = {
  loop: [1, 1] as [number, number],
  check: [2, 2] as [number, number],
  found: [3, 3] as [number, number],
  notFound: [4, 4] as [number, number],
};
