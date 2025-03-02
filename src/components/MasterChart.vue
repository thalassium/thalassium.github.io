<script setup>
import { onMounted, ref, watch, defineProps } from "vue";
import * as d3 from "d3";
import data from "../assets/data.json";
import { defineEmits } from "vue";
import { drawLabels } from "../utils/drawLabels"; // 🌟 Import de la gestion des labels

const props = defineProps({
  filters: Object,
  zoomLevel: { type: Number } // ✅ Ajoute un zoom par défaut
});

const chartRef = ref(null);
const emit = defineEmits(["segmentClick"]);

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
      "Régl."
    ])
    .range([
      "var(--basecolor-accidents)",
      "var(--basecolor-desaturation)",
      "var(--basecolor-materiel)",
      "var(--basecolor-environnement)",
      "var(--basecolor-physique)",
      "var(--basecolor-reglementation)"
    ]);


  ////////////////////////// HIERARCHIE //////////////////////////////////////////////////

  // 📌 Création de la hiérarchie
  const hierarchyRoot = d3.hierarchy(data);


  ///////////////////////////// TRI ALPHABETIQUE //////////////////////////////

  hierarchyRoot.each(node => {
    node.totalDescendants = node.descendants().length - 1; // Exclure le nœud lui-même
  });

  hierarchyRoot.each(node => {
    if (node.children) {
      node.children.sort((a, b) => b.totalDescendants - a.totalDescendants);
    }
  });

  ////////////////////////// PARTITION ////////////////////////////////////////////////////////

  // 📌 Appliquer la partition après le tri
  const partition = d3.partition().size([2 * Math.PI, radius * 0.9]);

  const root = partition(
    hierarchyRoot.sum(d => d.value)
  );


  ///////////////////////// FILTRES /////////////////////////////////////////////////////////

  const level1Nodes = root.descendants().filter((d) => d.depth >= 1 && d.depth <= 6);

  const getFilteredNodes = () => {
    return level1Nodes.filter(d => {
      const niveauFilter = props.filters?.niveau || "Tous";
      const categorieFilter = props.filters?.categorie || "Tous";

      // Vérification du niveau
      const matchesNiveau = (niveauFilter === "Tous") || (d.data?.niveau === niveauFilter || d.depth === 1);
      // Vérification de la catégorie
      const matchesCategorie = (categorieFilter === "Tous") || (d.data?.categorie == categorieFilter || d.data?.name === categorieFilter);

      return matchesNiveau && matchesCategorie;
    });
  };

  ////////////////////// RESIZE DES NODES A PARTIR DE DEPTH 3 //////////////////////////////

  const maxDepth = root.height;
  const thickness = radius / (maxDepth + 1);

  root.descendants().forEach(node => {
    if (node.depth > 1 && node.parent) {
      const siblings = node.parent.children;

      if (node === siblings[siblings.length - 1]) {
        const categoryNode = node.ancestors().find(n => n.depth === 1);
        if (categoryNode) {
          node.x1 = categoryNode.x1;
        }
      }
    }
  });

  ////////////////////// MISE A JOUR DU GRAPHE AVEC LES FILTRES //////////////////////////////

  const updateChart = () => {
    // Remove any existing SVG.
    d3.select(chartRef.value).select("svg").remove();

    // Use the chart container's dimensions.
    const bbox = chartRef.value.getBoundingClientRect();
    const containerWidth = bbox.width;
    const containerHeight = bbox.height;
    // Use the smaller dimension to compute the radius.
    const radius = Math.min(containerWidth, containerHeight) / 2;

    // Append an SVG with width/height matching the container.
    const svg = d3
      .select(chartRef.value)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("display", "block");

    // Append a group centered in the container.
    // Note: We removed the zoom scale from the transform.
    const g = svg
      .append("g")
      .attr("transform", `translate(${containerWidth / 2},${containerHeight / 2})`)
      .on("click", function (event, d) {
  emit("segmentClick", d.data);
  // Move g to the left (x = 0) and keep y at half of the container's height
  g.transition()
    .duration(600)
    .attr("transform", `translate(0,${containerHeight / 2})`);
});

    // Recreate the arc generator recomputing the arc sizes from the new radius.
    const arc = d3
      .arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1);

    // Now draw the segments (and other layers) using g so that their coordinates are based on the container.
    const filteredNodes = getFilteredNodes();
    if (filteredNodes.length === 0) return;

    const segmentGroup = g
  .selectAll("g.segment-group")
  .data(filteredNodes)
  .enter()
  .append("g")
  .attr("class", "segment-group")
  .on("click", function (event, d) {
    emit("segmentClick", d.data);
  
    // Move g to the left (x = 0) while keeping y centered
    g.transition()
  .duration(1000)
  .attr("transform", `translate(${containerWidth / 4}, ${containerHeight / 2})`);
  });

    segmentGroup
      .append("path")
      .attr("class", "arc-background")
      .attr("d", arc)
      .attr("fill", "#ffff")
      .attr("stroke", "none");

    const opacityValues = {
      1: 0.3, // Root children (depth 1) → Full opacity
      2: 0.45,  // Level 2 nodes → Slightly transparent
      3: 0.6,  // Level 3 nodes
      4: 0.6,  // Level 4 nodes
      5: 0.75,  // Level 5 nodes
      6: 0.75,   // Deepest level (depth 6) → Most transparent
    };

    segmentGroup
      .append("path")
      .attr("class", "segment")
      .attr("d", arc)
      .attr("fill", (d) => colorScale(d.ancestors().slice(-2, -1)[0]?.data.name))
      .style("fill-opacity", d => opacityValues[d.depth] || 0.4); // Default opacity for undefined depths

    segmentGroup
      .append("path")
      .attr("class", d => `node-depth-${d.depth} outer-border`)
      .attr("d", d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y1)
        .outerRadius(d => d.y1)
      )
      .each(function () {
        this.parentNode.appendChild(this); // Moves border to the top
      });



    /////////////////////////// Hightlight des descendants //////////////////////////


    ////////////////////////////// BORDURE ////////////////////////////////

    const borderLayer = g.append("g").attr("class", "border-layer");
    borderLayer
      .selectAll(".outer-border")
      .data(filteredNodes)
      .enter()
      .append("path")
      .attr("class", d => `node-depth-${d.depth} outer-border`)
      .attr("d", d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y1)
        .outerRadius(d => d.y1 + 2) // Slightly extend to prevent overlap issues
      )
      .style("pointer-events", "none") // Ensure the border does not interfere with interactions
      .each(function () {
        this.parentNode.appendChild(this); // Moves border to the top
      });

    ///////////////////////////// Titre de niveau / prérogative //////////////////////

    const titleLayer = g.append("g").attr("class", "title-layer");
    const firstNodesPerDepth = [];
    root.descendants().forEach(node => {
      if (!firstNodesPerDepth[node.depth]) {
        firstNodesPerDepth[node.deph] = node;
      }
    });

    ///////////////////////////////// AJOUTS BORDURES DE NIVEAU ET TITRES ///////////////////////////////////
    // 🌟 Ajoute un path unique pour chaque node de depth > 0
    borderLayer
      .selectAll(".outer-border-path")
      .data(getFilteredNodes().filter((d, index, arr) =>
        arr.findIndex(n => n.depth === d.depth) === index)) // ✅ Prend le premier node de chaque depth))
      .enter()
      .append("path")
      .attr("id", d => `path-${d.depth}`) // ID unique basé sur depth
      .attr("d", d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y1)
        .outerRadius(d => d.y1) // Positionne le texte juste au-dessus de l'arc
      )
      .style("fill", "none")
      .style("stroke", "none"); // Rendre invisible le path pour n'afficher que le texte

    titleLayer
      .selectAll(".border-title")
      .data(getFilteredNodes().filter((d, index, arr) =>
        arr.findIndex(n => n.depth === d.depth) === index)) // ✅ Prend le premier node de chaque depth))
      .enter()
      .append("text")
      .attr("class", "border-title")
      .attr("text-anchor", "left") // Centre le texte sur le path
      .attr("fill", "#ffffff")
      .attr("font-size", "5px")
      .attr("font-weight", "bold")
      .append("textPath")
      .attr("xlink:href", d => `#path-${d.depth}`) // 🌟 Associe le texte au path correspondant
      .attr("startOffset", "5") // Centre le texte sur l'arc
      .attr("dy", "-8px")
      .text(d => d.data.nivpre || ""); // Affiche le champ `niveau`


    // 📌 Ajout des labels et interactions via `drawLabels`
    drawLabels(segmentGroup, arc, "master");
  };


  watch(
    () => ({ ...props.filters, zoomLevel: props.zoomLevel }), // Rend réactif le zoom et les filtres
    () => {
      updateChart();
    },
    { deep: true, immediate: true }
  );
});
</script>

<template>
  <div ref="chartRef" class="chart-container"></div>
</template>
