/**
 * 删除倒数第 k 个节点代码模板
 */

export const REMOVE_K_CODE_JS = `function removeKthFromEnd(head, k) {
  const dummy = new ListNode(-1);
  dummy.next = head;
  let fast = dummy;
  let slow = dummy;
  for (let i = 0; i < k; i++) {
    fast = fast.next;
  }
  while (fast.next !== null) {
    fast = fast.next;
    slow = slow.next;
  }
  slow.next = slow.next.next;
  return dummy.next;
}`;

export const REMOVE_K_CODE_LINES: Record<string, [number, number]> = {
  'init': [2, 5],
  'advance-fast': [6, 7],
  'move': [9, 10],
  'remove': [12, 12],
  'finish': [13, 13],
};
