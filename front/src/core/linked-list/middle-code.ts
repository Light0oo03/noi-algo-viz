/**
 * 链表中点代码模板
 */

export const MIDDLE_CODE_JS = `function middleNode(head) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}`;

export const MIDDLE_CODE_LINES: Record<string, [number, number]> = {
  'init': [2, 3],
  'move': [5, 6],
  'finish': [8, 8],
};
