export const MERGE_SORT_CODE_JS = `function mergeSort(nums, left = 0, right = nums.length - 1) {
  if (left >= right) return;                              // 1
  const mid = Math.floor((left + right) / 2);             // 2
  mergeSort(nums, left, mid);                             // 3
  mergeSort(nums, mid + 1, right);                        // 4
  const temp = [];                                        // 5
  let i = left, j = mid + 1;                              // 6
  while (i <= mid && j <= right) {                        // 7
    if (nums[i] <= nums[j]) temp.push(nums[i++]);         // 8
    else temp.push(nums[j++]);                            // 9
  }
  while (i <= mid) temp.push(nums[i++]);                  // 10
  while (j <= right) temp.push(nums[j++]);                // 11
  for (let k = 0; k < temp.length; k++) nums[left + k] = temp[k]; // 12
}`;

export const MERGE_SORT_CODE_LINES = {
  base: [1, 1] as [number, number],
  mid: [2, 2] as [number, number],
  recurseLeft: [3, 3] as [number, number],
  recurseRight: [4, 4] as [number, number],
  temp: [5, 6] as [number, number],
  compareLoop: [7, 7] as [number, number],
  takeLeft: [8, 8] as [number, number],
  takeRight: [9, 9] as [number, number],
  restLeft: [10, 10] as [number, number],
  restRight: [11, 11] as [number, number],
  writeBack: [12, 12] as [number, number],
};
