/**
 * 合并两个有序链表代码模板
 */

export const MERGE_CODE_JS = `function mergeTwoLists(a, b) {
  const dummy = new ListNode(-1);
  let tail = dummy;
  let p1 = a;
  let p2 = b;
  while (p1 !== null && p2 !== null) {
    if (p1.val <= p2.val) {
      tail.next = p1;
      p1 = p1.next;
    } else {
      tail.next = p2;
      p2 = p2.next;
    }
    tail = tail.next;
  }
  tail.next = p1 !== null ? p1 : p2;
  return dummy.next;
}`;

export const MERGE_CODE_LINES: Record<string, [number, number]> = {
  'init': [2, 5],
  'compare': [7, 7],
  'attach-left': [8, 9],
  'attach-right': [11, 12],
  'move-tail': [14, 14],
  'append-rest': [16, 16],
  'finish': [17, 17],
};
