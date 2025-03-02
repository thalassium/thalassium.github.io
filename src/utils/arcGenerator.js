// arcGenerator.js
import * as d3 from "d3";

/**
 * Crée et retourne une fonction arc pour un sunburst chart.
 * @param {Number} radius - Rayon maximal du graphique.
 * @returns {Function} Une fonction d'arc D3.
 */
export function createArc(radius) {
  return d3
    .arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1);
}
