export const INSERTION_SORT_CODE_JS = `function insertionSort(nums) {
  for (let i = 1; i < nums.length; i++) {          // 1
    let j = i;                                      // 2
    while (j > 0 && nums[j - 1] > nums[j]) {       // 3
      [nums[j - 1], nums[j]] = [nums[j], nums[j - 1]]; // 4
      j--;                                          // 5
    }
  }
  return nums;                                      // 6
}`;

export const INSERTION_SORT_CODE_LINES = {
  outer: [1, 1] as [number, number],
  init: [2, 2] as [number, number],
  loop: [3, 3] as [number, number],
  swap: [4, 4] as [number, number],
  dec: [5, 5] as [number, number],
  done: [6, 6] as [number, number],
};
