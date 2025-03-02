import * as d3 from "d3";

/**
 * Calcule les bornes théoriques d'un segment au niveau courant, 
 * dans le cas où tous les ancêtres (depuis root) n'auraient eu qu'un seul enfant.
 * 
 * @param {Object} node - Le nœud actuel de la partition (issue de d3.hierarchy)
 * @param {Number} maxDepth - La profondeur maximale de la hiérarchie
 * @param {Number} radius - Le rayon total du Sunburst Chart
 * @returns {Object} - Les bornes théoriques { x0, x1, y0, y1 }
 */
export function calculateSegmentBounds(node, maxDepth, radius) {
  // Si tous les parents n'avaient qu'un enfant, l'angle alloué serait la totalité du cercle.
let theoreticalX0, theoreticalX1;
if (node.depth > 1) {
  // Remonter jusqu'à l'ancêtre de depth 1
  let ancestor = node;
  while (ancestor.depth > 1) {
    ancestor = ancestor.parent;
  }
  theoreticalX0 = ancestor.x0;
  theoreticalX1 = ancestor.x1;
} else {
  theoreticalX0 = 0;
  theoreticalX1 = 2 * Math.PI;
}

  // On répartit uniformément le rayon entre tous les niveaux.
  const thickness = radius / (maxDepth + 1);
  const theoreticalY0 = node.depth * thickness;
  const theoreticalY1 = (node.depth + 1) * thickness;

  return {
    x0: theoreticalX0,
    x1: theoreticalX1,
    y0: theoreticalY0,
    y1: theoreticalY1
  };
}