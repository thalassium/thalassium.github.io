<script setup>
import { onMounted, ref } from "vue";
import * as d3 from "d3";
import data from "../assets/data.json";

const chartRef = ref(null);

onMounted(() => {
  const updateSize = () => {
    const container = chartRef.value;
    const width = container.clientWidth * 0.8;
    const height = container.clientHeight * 0.8;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(chartRef.value).select("svg");
    svg.attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `${-radius} ${-radius} ${2 * radius} ${2 * radius}`);

    return { width, height, radius };
  };

  let { width, height, radius } = updateSize();
  window.addEventListener("resize", () => {
    ({ width, height, radius } = updateSize());
  });

  // 📌 Création du SVG
  const svg = d3.select(chartRef.value)
    .append("svg")
    .classed("chart", true)
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g");

  updateSize();

  const partition = d3.partition().size([2 * Math.PI, radius]);

  // 📌 Vérification que les données sont bien chargées
  console.log("Données JSON chargées :", data);

  const root = d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

  partition(root);

  // 📌 Vérification du nombre d'arcs attendus
  console.log("Nombre d'éléments dans l'arbre :", root.descendants().length);

  // 📌 Récupération des couleurs depuis le CSS
  const getColorFromCSS = (className) =>
    getComputedStyle(document.documentElement).getPropertyValue(className).trim() || "#ccc";

  const baseColors = {
    "Physique": getColorFromCSS("--basecolor-physique"),
    "Accidents": getColorFromCSS("--basecolor-accidents"),
    "Désaturation": getColorFromCSS("--basecolor-desaturation"),
    "Matériel": getColorFromCSS("--basecolor-materiel"),
    "Réglementation": getColorFromCSS("--basecolor-reglementation"),
    "Milieu et Environnement": getColorFromCSS("--basecolor-environnement"),
  };

  const getFillColor = (d) => {
    let rootCategory = d.ancestors().reverse()[1]?.data.name || d.data.name;
    let baseColor = baseColors[rootCategory] || getColorFromCSS("--default-color");
    console.log("Catégorie:", rootCategory, "Couleur appliquée:", baseColor);
    return baseColor;
  };

  // 📌 Création des arcs
  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1);

  const paths = svg.selectAll("path")
    .data(root.descendants().slice(1))
    .enter()
    .append("path")
    .classed("arc", true)
    .attr("d", arc)
    .style("fill", getFillColor);

  console.log("Nombre d'arcs créés :", paths.size());

  // 📌 Ajout des labels
  svg.selectAll("text")
    .data(root.descendants().slice(1))
    .enter()
    .append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("fill", "#000")
    .style("font-size", d => (d.y1 - d.y0 > 10 ? "12px" : "0px"))
    .text(d => d.data.name);
});
</script>

<template>
  <div id="chart-container" ref="chartRef"></div>
</template>

<style scoped>
@import "../style.css";
</style>