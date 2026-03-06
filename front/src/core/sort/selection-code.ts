export const SELECTION_SORT_CODE_JS = `function selectionSort(nums) {
  for (let i = 0; i < nums.length - 1; i++) {      // 1
    let minIndex = i;                                // 2
    for (let j = i + 1; j < nums.length; j++) {     // 3
      if (nums[j] < nums[minIndex]) minIndex = j;   // 4
    }
    if (minIndex !== i) {                            // 5
      [nums[i], nums[minIndex]] = [nums[minIndex], nums[i]]; // 6
    }
  }
  return nums;                                       // 7
}`;

export const SELECTION_SORT_CODE_LINES = {
  outer: [1, 1] as [number, number],
  initMin: [2, 2] as [number, number],
  inner: [3, 3] as [number, number],
  updateMin: [4, 4] as [number, number],
  checkSwap: [5, 5] as [number, number],
  swap: [6, 6] as [number, number],
  done: [7, 7] as [number, number],
};
