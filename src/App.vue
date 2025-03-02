<script setup>
import { ref, computed, onMounted } from "vue";
import MasterChart from "./components/MasterChart.vue";
import ControlPanel from "./components/ControlPanel.vue";
import ContentViewer from "./components/ContentViewer.vue";
import "./style.css";

// Store filters and update them
const filters = ref({ niveau: "Tous", categorie: "Tous" });
const zoomLevel = ref(1);
const updateZoom = (newZoom) => {
  zoomLevel.value = parseFloat(newZoom);
};

// Selected segment
const selectedSegment = ref(null);
const showContentViewer = ref(false);

// Reference for chart container size updates
const chartContainerRef = ref(null);
const svgSize = ref({ width: "auto", height: "auto" });

// Track visibility state for fade-in effect
const showContent = ref(false);

// Adjust size dynamically based on actual SVG dimensions
const updateSize = () => {
  const svg = chartContainerRef.value?.querySelector("svg");
  if (svg) {
    svgSize.value.width = `${svg.getBBox().width}px`;  // ✅ More accurate than clientWidth
    svgSize.value.height = `${svg.getBBox().height}px`;
  }
};

onMounted(() => {
  setTimeout(() => {
    showContent.value = true;
    updateSize(); // Ensure the container resizes correctly
  }, 500);
});

const handleSegmentClick = (segment) => {
  selectedSegment.value = segment;
  showContentViewer.value = true;
};

// The app container places its children with flex. When the content viewer is visible, we align items to flex-start.
const appContainerStyle = computed(() => {
  return showContentViewer.value 
    ? { justifyContent: "flex-start" } 
    : { justifyContent: "center" };
});

// When the content viewer is visible, force the chart container to 40vw (its width) without applying a right margin.
// The spacer div will provide the 10vw gap.
const chartContainerStyle = computed(() => {
  if (showContentViewer.value) {
    return { width: "40vw" };
  } else {
    return {};
  }
});
</script>

<template>
  <div class="app-container" 
       :class="{ hidden: !showContent, 'fade-in': showContent }" 
       :style="appContainerStyle">
    <div class="chart-container" 
         ref="chartContainerRef"
         :style="[ { height: svgSize.height }, chartContainerStyle ]">
      <!-- ... MasterChart and ControlPanel here ... -->
      <MasterChart 
        :filters="filters" 
        :zoomLevel="zoomLevel" 
        @chartUpdated="updateSize"  
        @segmentClick="handleSegmentClick" />
      <div class="control-panel-container">
        <ControlPanel
          @updateFilters="(newFilters) => { filters = newFilters; }"
          @updateZoom="updateZoom"/>
      </div>
    </div>
    <!-- Spacer div providing 10vw gap -->
    <div v-if="showContentViewer" class="spacer"></div>
    <transition name="fade">
      <ContentViewer v-if="showContentViewer" :segment="selectedSegment" />
    </transition>
  </div>
</template>

<style scoped>
/* Initially hidden */
.hidden {
  visibility: hidden;
  opacity: 0;
}

/* Smooth fade-in effect */
.fade-in {
  visibility: visible;
  opacity: 1;
  transition: opacity 1s ease-in-out;
}

.app-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  /* No gap here since the spacer div provides the gap */
}

/* Chart container that holds the MasterChart and ControlPanel */
.chart-container {
  position: relative;
  width: 100%;
  height: 96vh;
  margin-top: 2vh;
  margin-bottom: 2vh;
}

/* Forcing the SVG to scale responsively within the chart container */
.chart-container svg {
  width: 100%;
  height: auto;
}

/* Control panel aligned to the left edge of the chart container */
.control-panel-container {
  position: absolute;
  top: 1px;
  left: 0;
  z-index: 10;
  opacity: 0.5;
}

/* Spacer div to provide a 10vw gap between the chart container and content viewer */
.spacer {
  width: 10vw;
  flex-shrink: 0;
}

/* Content viewer that takes 50vw on the right side */
.content-viewer {
  width: 50vw;
  height: 100vh;
  background: rgba(225, 226, 233, 0.9);
  color: black;
  font-size: 12px;
  padding: 20px;
  transition: transform 1s ease-in-out;
}
</style>

