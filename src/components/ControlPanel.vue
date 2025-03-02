<script setup>
import { ref, defineEmits } from "vue";

const emit = defineEmits(["updateFilters", "updateZoom"]);
const niveau = ref("Tous");
const categorie = ref("Tous");
const zoomLevel = ref(1); // ✅ Default zoom level

// Update filters and emit to parent
const updateFilters = () => {
  emit("updateFilters", { niveau: niveau.value, categorie: categorie.value });
};

// Update zoom level and emit to parent
const changeZoom = (increment) => {
  const newZoom = Math.min(1.5, Math.max(1, zoomLevel.value + increment)); // ✅ Keep between 1 and 1.5
  zoomLevel.value = newZoom;
  emit("updateZoom", newZoom);
};
</script>

<template>
  <div class="control-panel">
    
    <!-- 📌 Container for horizontal selects -->
    <div class="select-container">
      <select id="niveau" v-model="niveau" @change="updateFilters">
        <option value="Tous">Niveau</option>
        <option value="Niveau 1">Niveau 1</option>
        <option value="Niveau 2">Niveau 2</option>
        <option value="Niveau 3">Niveau 3</option>
      </select>

      <select id="categorie" v-model="categorie" @change="updateFilters">
        <option value="Tous">Catégorie</option>
        <option value="Accidents">Accidents</option>
        <option value="Désaturation">Désaturation</option>
        <option value="Matériel">Matériel</option>
        <option value="Milieu et environnement">Milieu et environnement</option>
        <option value="Principes physiques">Principes physiques</option>
        <option value="Réglementation">Réglementation</option>
      </select>
    </div>

    <!-- 📌 Separate div for zoom buttons -->
    <div class="zoom-container">
      <button @click="changeZoom(-0.05)">-</button>
      <button @click="changeZoom(0.05)">+</button>
    </div>

  </div>
</template>

<style scoped>
/* 📌 Set container width in % */
.control-panel {
  width: 15%;  /* ✅ Adjusts width dynamically */
  min-width: 150px; /* Ensures it doesn't get too small */
  max-width: 250px; /* Avoids excessive width */
  display: flex;
  flex-direction: column; /* ✅ Stack elements */
  gap: 5px;
  padding: 2px;
}

/* 📌 Align dropdowns horizontally */
.select-container {
  display: flex;
  justify-content: space-between; /* ✅ Align items in a row */
  gap: 10px; /* Adds space between selects */
}

/* 📌 Styling for dropdowns */
select {
  flex: 1; /* ✅ Makes both dropdowns equal width */
  padding: 5px;
  font-size: 6px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

/* 📌 Zoom controls are now in a separate div */
.zoom-container {
  display: flex;
  justify-content: left;
  gap: 10px;
  margin-top: 5px; /* ✅ Pushes buttons down */
}

button {
  background: #1c2434;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 10px;
}

button:hover {
  background: #0f172a;
}
</style>