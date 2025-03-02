<script setup>
import { onMounted, ref } from "vue";
import * as d3 from "d3";
import data from "../assets/data.json";
import { defineEmits } from "vue";
import { drawLabels } from "../utils/drawLabels"; // 🌟 Import du module pour les labels
const emit = defineEmits(["update-info"]);
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
        .sum((d) => (d.children ? 0 : 1))
        .sort((a, b) => b.value - a.value)
    );

  const root = partition(data);

  // 🌟 Filtrer uniquement les segments où `niveau = 2`
  const level2Nodes = root.descendants().filter((d) => d.data.niveau === 2);

  const svg = d3
    .select(chartRef.value)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100vw")
    .style("height", "100vh")
    .style("position", "absolute") /* 🌟 Superposition avec les autres charts */
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1);

  const segmentGroup = svg
    .selectAll("g.segment-group")
    .data(level2Nodes)
    .enter()
    .append("g")
    .attr("class", "segment-group");

  // 📌 Création des segments
  segmentGroup
  .append("path")
  .attr("class", "arc-background")
  .attr("d", arc)
  .attr("fill", "#fff")       // Fond blanc pour l'arc
  .attr("stroke", "none");

  segmentGroup
    .append("path")
    .attr("class", "segment")
    .attr("d", arc)
    .attr("fill", (d) => colorScale(d.ancestors().slice(-2, -1)[0]?.data.name))
    .attr("stroke", "#000")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .style("fill-opacity", 0.9);

  // 📌 Ajout des labels et interactions via `drawLabels`
  drawLabels(segmentGroup, arc, "niv2", emit);
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
  z-index: 1; /* 🌟 Niv2Chart est bien en dessous */
}
</style>
