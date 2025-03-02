<script setup>
import { onMounted, ref } from "vue";
import * as d3 from "d3";
import data from "../assets/data.json";
import { defineEmits } from "vue";
import { drawLabels } from "../utils/drawLabels";
import { calculateSegmentBounds } from "../utils/calculateSegmentBounds";

const emit = defineEmits(["update-info"]);
const chartRef = ref(null);

// Définition du niveau à afficher (ici, node.depth = 6)
const DepNode = 2;

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

  // Création de la hiérarchie et partition standard
  const hierarchyRoot = d3.hierarchy(data).sum(d => (d.children ? 0 : 1));
    
  // On trie les nœuds par ordre alphabétique
  hierarchyRoot.each(node => {
    if (node.children) {
      node.children.sort((a, b) => d3.ascending(a.data.name, b.data.name));
    }
  });
  
    const partition = d3.partition().size([2 * Math.PI, radius]);
    const root = partition(hierarchyRoot);
    const maxDepth = root.height;// ou root.maxDepth selon la version de D3

  // Filtrer les segments pour n'avoir que ceux dont la profondeur est égale à DepNode
  const levelNodes = root.descendants().filter(d => d.depth === DepNode);

  // Ajuster les bornes de chaque segment avec calculateSegmentBounds,
  // puis diviser chaque valeur par (1 + nombre de siblings)
  levelNodes.forEach(node => {
  const bounds = calculateSegmentBounds(node, maxDepth, radius);
  const siblingsCount = node.parent ? node.parent.children.length : 1;
  // Si on souhaite diviser les bornes par (1 + siblingsCount), on peut appliquer :
  node.x0 = bounds.x0 / (siblingsCount);
  node.x1 = bounds.x1 / (siblingsCount);
  node.y0 = bounds.y0 / (siblingsCount);
  node.y1 = bounds.y1 / (siblingsCount);
});

  const svg = d3
    .select(chartRef.value)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100vw")
    .style("height", "100vh")
    .style("position", "absolute")
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1);

  const segmentGroup = svg
    .selectAll("g.segment-group")
    .data(levelNodes)
    .enter()
    .append("g")
    .attr("class", "segment-group");

  segmentGroup.append("path")
    .attr("class", "arc-background")
    .attr("d", arc)
    .attr("fill", "#fff")
    .attr("stroke", "none");

  segmentGroup.append("path")
    .attr("class", "segment")
    .attr("d", arc)
    .attr("fill", d => {
      const ancestor = d.ancestors().slice(-2, -1)[0];
      return ancestor ? colorScale(ancestor.data.name) : "gray";
    })
    .attr("stroke", "#000")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .style("fill-opacity", 1);

  drawLabels(segmentGroup, arc, "niv1pe20", emit);
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
  z-index: 1;
}
</style>
