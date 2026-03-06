export const LEVEL_ORDER_CODE_JS = `function levelOrder(root) {
  if (!root) return [];      // 1
  const queue = [root];       // 2
  const result = [];          // 3
  while (queue.length > 0) {  // 4
    const node = queue.shift();  // 5
    result.push(node.val);     // 6
    if (node.left) queue.push(node.left);   // 7
    if (node.right) queue.push(node.right); // 8
  }
  return result;              // 9
}`;

export const LEVEL_ORDER_CODE_PY = `def level_order(root):
    if not root:          # 1
        return []
    queue = [root]        # 2
    result = []           # 3
    while queue:          # 4
        node = queue.pop(0)   # 5
        result.append(node.val)  # 6
        if node.left:     # 7
            queue.append(node.left)
        if node.right:    # 8
            queue.append(node.right)
    return result         # 9
`;
