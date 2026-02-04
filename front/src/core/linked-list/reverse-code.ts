/**
 * 反转链表代码模板
 */

export const REVERSE_CODE_JS = `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`;

export const REVERSE_CODE_LINES: Record<string, [number, number]> = {
  'init': [2, 3],
  'save-next': [5, 5],
  'reverse': [6, 6],
  'move': [7, 8],
  'finish': [10, 10],
};
