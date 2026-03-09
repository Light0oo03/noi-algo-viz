export const BINARY_INSERTION_SORT_CODE_JS = `function binaryInsertionSort(nums) {
  for (let i = 1; i < nums.length; i++) {               // 1
    const key = nums[i];                                 // 2
    let left = 0, right = i - 1;                        // 3
    while (left <= right) {                              // 4
      const mid = (left + right) >> 1;                  // 5
      if (nums[mid] > key) right = mid - 1;             // 6
      else left = mid + 1;                              // 7
    }
    for (let j = i - 1; j >= left; j--) nums[j + 1] = nums[j]; // 8
    nums[left] = key;                                    // 9
  }
  return nums;                                           // 10
}`;

export const BINARY_INSERTION_SORT_CODE_LINES = {
  outer: [1, 1] as [number, number],
  init: [2, 3] as [number, number],
  bsearchLoop: [4, 4] as [number, number],
  mid: [5, 5] as [number, number],
  cmpLeft: [6, 6] as [number, number],
  cmpRight: [7, 7] as [number, number],
  shift: [8, 8] as [number, number],
  place: [9, 9] as [number, number],
  done: [10, 10] as [number, number],
};
