<template>
  <div class="scorecard-skeleton">
    <div class="scorecard-skeleton-row">
      <div v-for="n in (columns + 1)" :key="'h-' + n" class="scorecard-skeleton-header"></div>
    </div>
    <div v-for="row in rows" :key="'r-' + row" class="scorecard-skeleton-row">
      <div v-for="n in (columns + 1)" :key="'c-' + n" class="scorecard-skeleton-cell"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  rows?: number
  columns?: number
}>(), {
  rows: 4,
  columns: 6,
})
</script>
