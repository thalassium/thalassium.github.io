<script setup>
import { ref } from "vue";
import { defineProps, watch, computed } from "vue";


const isVisible = ref(false);

const props = defineProps({
  segment: Object, // ✅ Make sure the segment data is passed
});

const segmentData = computed(() => props.segment);

watch(segmentData, (newSegment) => {
});

watch(
  () => props.segment,
  (newSegment) => {
    if (newSegment) {
      isVisible.value = true; // ✅ Show panel when segment updates
    }
  },
  { immediate: true } // ✅ Ensures it reacts even on first render
);
</script>

<template>
    <transition name="fade">
      <div v-if="segment" class="content-viewer">
        <h2>{{ segment?.name || "No Name" }}</h2>
        <p v-if="segment?.description">{{ segment.description }}</p>
        <p v-else>No description available.</p>
      </div>
    </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>
