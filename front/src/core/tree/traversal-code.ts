export const TRAVERSAL_CODE_JS = {
  preorder: `function preorder(root) {
  if (!root) return;        // 1
  visit(root);              // 2
  preorder(root.left);      // 3
  preorder(root.right);     // 4
}                           // 5`,

  inorder: `function inorder(root) {
  if (!root) return;        // 1
  inorder(root.left);       // 2
  visit(root);              // 3
  inorder(root.right);      // 4
}                           // 5`,

  postorder: `function postorder(root) {
  if (!root) return;        // 1
  postorder(root.left);     // 2
  postorder(root.right);    // 3
  visit(root);              // 4
}                           // 5`,
};

export const TRAVERSAL_CODE_PY = {
  preorder: `def preorder(root):
    if not root:           # 1
        return
    visit(root)            # 2
    preorder(root.left)    # 3
    preorder(root.right)   # 4`,

  inorder: `def inorder(root):
    if not root:           # 1
        return
    inorder(root.left)     # 2
    visit(root)            # 3
    inorder(root.right)    # 4`,

  postorder: `def postorder(root):
    if not root:           # 1
        return
    postorder(root.left)   # 2
    postorder(root.right)  # 3
    visit(root)            # 4`,
};
