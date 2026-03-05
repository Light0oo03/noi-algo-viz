export const FIBONACCI_SEARCH_CODE_JS = `function fibonacciSearch(nums, target) {
  let fibMMm2 = 0, fibMMm1 = 1, fibM = fibMMm1 + fibMMm2; // 1
  while (fibM < nums.length) {                              // 2
    fibMMm2 = fibMMm1;                                      // 3
    fibMMm1 = fibM;                                         // 4
    fibM = fibMMm1 + fibMMm2;                               // 5
  }
  let offset = -1;                                          // 6
  while (fibM > 1) {                                        // 7
    const i = Math.min(offset + fibMMm2, nums.length - 1);  // 8
    if (nums[i] < target) {                                 // 9
      fibM = fibMMm1; fibMMm1 = fibMMm2; fibMMm2 = fibM - fibMMm1; // 10
      offset = i;                                           // 11
    } else if (nums[i] > target) {                          // 12
      fibM = fibMMm2; fibMMm1 = fibMMm1 - fibMMm2; fibMMm2 = fibM - fibMMm1; // 13
    } else return i;                                        // 14
  }
  if (fibMMm1 && nums[offset + 1] === target) return offset + 1; // 15
  return -1;                                                // 16
}`;

export const FIBONACCI_SEARCH_CODE_LINES = {
  init: [1, 1] as [number, number],
  grow: [2, 5] as [number, number],
  offset: [6, 6] as [number, number],
  loop: [7, 8] as [number, number],
  less: [9, 11] as [number, number],
  greater: [12, 13] as [number, number],
  found: [14, 14] as [number, number],
  finalCheck: [15, 15] as [number, number],
  notFound: [16, 16] as [number, number],
};
