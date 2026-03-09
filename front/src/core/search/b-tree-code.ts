export const B_TREE_SEARCH_CODE_JS = `function bTreeSearch(root, target) {
  let node = root;                                     // 1
  while (node) {                                       // 2
    let i = 0;                                         // 3
    while (i < node.keys.length && target > node.keys[i]) i++; // 4
    if (i < node.keys.length && target === node.keys[i]) return true; // 5
    node = node.leaf ? null : node.children[i];        // 6
  }
  return false;                                        // 7
}`;

export const B_TREE_SEARCH_CODE_LINES = {
  init: [1, 1] as [number, number],
  loop: [2, 2] as [number, number],
  setI: [3, 3] as [number, number],
  moveI: [4, 4] as [number, number],
  found: [5, 5] as [number, number],
  descend: [6, 6] as [number, number],
  notFound: [7, 7] as [number, number],
};
