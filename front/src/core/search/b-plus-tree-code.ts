export const B_PLUS_TREE_SEARCH_CODE_JS = `function bPlusTreeSearch(root, target) {
  let node = root;                                      // 1
  while (!node.leaf) {                                  // 2
    let i = 0;                                          // 3
    while (i < node.keys.length && target >= node.keys[i]) i++; // 4
    node = node.children[i];                            // 5
  }
  for (let i = 0; i < node.keys.length; i++) {         // 6
    if (node.keys[i] === target) return true;           // 7
  }
  return false;                                         // 8
}`;

export const B_PLUS_TREE_SEARCH_CODE_LINES = {
  init: [1, 1] as [number, number],
  routeLoop: [2, 2] as [number, number],
  routeInit: [3, 3] as [number, number],
  routeMove: [4, 4] as [number, number],
  descend: [5, 5] as [number, number],
  leafLoop: [6, 6] as [number, number],
  found: [7, 7] as [number, number],
  notFound: [8, 8] as [number, number],
};
