export const JUMP_SEARCH_CODE_JS = `function jumpSearch(nums, target) {
  const step = Math.floor(Math.sqrt(nums.length));        // 1
  let prev = 0;                                           // 2
  let next = step;                                        // 3
  while (prev < nums.length && nums[Math.min(next, nums.length) - 1] < target) { // 4
    prev = next;                                          // 5
    next += step;                                         // 6
  }
  for (let i = prev; i < Math.min(next, nums.length); i++) { // 7
    if (nums[i] === target) return i;                     // 8
  }
  return -1;                                              // 9
}`;

export const JUMP_SEARCH_CODE_LINES = {
  init: [1, 3] as [number, number],
  blockLoop: [4, 4] as [number, number],
  moveBlock: [5, 6] as [number, number],
  linearLoop: [7, 7] as [number, number],
  found: [8, 8] as [number, number],
  notFound: [9, 9] as [number, number],
};
