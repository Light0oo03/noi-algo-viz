/**
 * 链表判环代码模板
 */

export const CYCLE_CODE_JS = `function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`;

export const CYCLE_CODE_LINES: Record<string, [number, number]> = {
  'init': [2, 3],
  'move': [5, 6],
  'meet': [7, 7],
  'finish': [9, 9],
};
