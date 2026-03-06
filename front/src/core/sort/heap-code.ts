export const HEAP_SORT_CODE_JS = `function heapSort(nums) {
  const n = nums.length;                                   // 1
  const heapify = (size, i) => {                           // 2
    let largest = i;                                       // 3
    const l = 2 * i + 1, r = 2 * i + 2;                    // 4
    if (l < size && nums[l] > nums[largest]) largest = l;  // 5
    if (r < size && nums[r] > nums[largest]) largest = r;  // 6
    if (largest !== i) {                                   // 7
      [nums[i], nums[largest]] = [nums[largest], nums[i]]; // 8
      heapify(size, largest);                              // 9
    }
  };
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i); // 10
  for (let end = n - 1; end > 0; end--) {                 // 11
    [nums[0], nums[end]] = [nums[end], nums[0]];          // 12
    heapify(end, 0);                                       // 13
  }
  return nums;                                             // 14
}`;

export const HEAP_SORT_CODE_LINES = {
  init: [1, 1] as [number, number],
  heapifyDef: [2, 4] as [number, number],
  compareLeft: [5, 5] as [number, number],
  compareRight: [6, 6] as [number, number],
  checkSwap: [7, 7] as [number, number],
  swap: [8, 8] as [number, number],
  recurse: [9, 9] as [number, number],
  build: [10, 10] as [number, number],
  extractLoop: [11, 11] as [number, number],
  moveMax: [12, 12] as [number, number],
  fixHeap: [13, 13] as [number, number],
  done: [14, 14] as [number, number],
};
