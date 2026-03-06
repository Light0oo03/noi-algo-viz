export const SHELL_SORT_CODE_JS = `function shellSort(nums) {
  for (let gap = Math.floor(nums.length / 2); gap > 0; gap = Math.floor(gap / 2)) { // 1
    for (let i = gap; i < nums.length; i++) {                                        // 2
      let j = i;                                                                      // 3
      while (j >= gap && nums[j - gap] > nums[j]) {                                  // 4
        [nums[j - gap], nums[j]] = [nums[j], nums[j - gap]];                         // 5
        j -= gap;                                                                     // 6
      }
    }
  }
  return nums;                                                                        // 7
}`;

export const SHELL_SORT_CODE_LINES = {
  gapLoop: [1, 1] as [number, number],
  iLoop: [2, 3] as [number, number],
  compare: [4, 4] as [number, number],
  swap: [5, 5] as [number, number],
  move: [6, 6] as [number, number],
  done: [7, 7] as [number, number],
};
