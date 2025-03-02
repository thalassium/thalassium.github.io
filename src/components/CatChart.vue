<script setup>
import { onMounted, ref } from "vue";
import * as d3 from "d3";
import data from "../assets/data.json";
import { createArc } from "../utils/arcGenerator"; // Import de la fonction arc
import { drawLabels } from "../utils/drawLabels"; // Import de la fonction de labels

const chartRef = ref(null);

onMounted(() => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const radius = Math.min(width, height) / 2;

  const colorScale = d3
    .scaleOrdinal()
    .domain([
      "Accidents",
      "Désaturation",
      "Matériel",
      "Milieu et environnement",
      "Principes physiques",
      "Réglementation"
    ])
    .range([
      "var(--basecolor-accidents)",
      "var(--basecolor-desaturation)",
      "var(--basecolor-materiel)",
      "var(--basecolor-environnement)",
      "var(--basecolor-physique)",
      "var(--basecolor-reglementation)"
    ]);


    const partition = (data) =>
  d3.partition().size([2 * Math.PI, radius])(
    d3
      .hierarchy(data)
      .eachBefore((node) => {
        if (node.depth === 1 && node.children) {
          node.children.sort((a, b) => (b.children ? b.children.length : 0) - (a.children ? a.children.length : 0));
        }
      })
      .sum((d) => (d.children ? 0 : 1))
  );

const root = partition(data);

  const svg = d3
    .select(chartRef.value)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100vw")
    .style("height", "100vh")
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Utilisation de la fonction importée pour créer l'arc
  const arc = createArc(radius);

  const segmentGroup = svg
    .selectAll("g.segment-group")
    .data(root.children || [])
    .enter()
    .append("g")
    .attr("class", "segment-group");

  // Création des segments
  segmentGroup
  .append("path")
  .attr("class", "arc-background")
  .attr("d", arc)
  .attr("fill", "#ffff")       // Fond blanc pour l'arc
  .attr("stroke", "none");

  segmentGroup
    .append("path")
    .attr("class", "segment")
    .attr("d", arc)
    .attr("fill", (d) =>
      colorScale(d.ancestors().slice(-2, -1)[0]?.data.name)
    )
    .attr("stroke", "#000")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .style("fill-opacity", 0.4);

  // Ajout des labels et interactions via `drawLabels`
  drawLabels(segmentGroup, arc, "cat");
});
</script>

<template>
  <div ref="chartRef" class="chart-container"></div>
</template>


<style scoped>
.chart-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
}

::deep .segment-group:hover text {
  fill: #ce8a7bf7 !important;
}
</style>
