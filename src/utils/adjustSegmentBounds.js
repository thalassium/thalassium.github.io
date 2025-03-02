/**
 * Pour chaque niveau (depth > 1), si le dernier nœud de ce niveau a un x1
 * inférieur à celui du dernier nœud du niveau précédent, on l'ajuste.
 *
 * @param {Object} nodesByDepth - Objet regroupant les nœuds par profondeur,
 *                                par exemple { 1: [nodes], 2: [nodes], ... }
 */
export function adjustLastNodeX1(nodesByDepth) {
  Object.keys(nodesByDepth).forEach(depthKey => {
    const depth = parseInt(depthKey, 10);
    if (depth > 1) { // On commence à partir du niveau 2 (depth > 1)
      const currentNodes = nodesByDepth[depth];
      const prevNodes = nodesByDepth[depth - 1];
      if (currentNodes && currentNodes.length && prevNodes && prevNodes.length) {
        const lastNodeCurrent = currentNodes[currentNodes.length - 1];
        const lastNodePrev = prevNodes[prevNodes.length - 1];
        // Si x1 du dernier nœud du niveau courant est inférieur à x1 du dernier nœud du niveau précédent,
        // alors on l'ajuste
        if (lastNodeCurrent.x1 < lastNodePrev.x1) {
          lastNodeCurrent.x1 = lastNodePrev.x1;
        }
      }
    }
  });
}
