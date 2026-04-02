<template>
    <div class="glass-card p-0 overflow-hidden animate-pulse">
        <div class="scorecard-skeleton">
            <!-- Header row -->
            <div class="scorecard-skeleton-row border-b border-white/30 dark:border-white/10">
                <div class="scorecard-skeleton-header rounded-tl-2xl"></div>
                <div v-for="n in columns" :key="'h-' + n" class="scorecard-skeleton-header"
                    :class="{ 'rounded-tr-2xl': n === columns }"></div>
            </div>
            <!-- Data rows -->
            <div v-for="row in rows" :key="'r-' + row" class="scorecard-skeleton-row">
                <div v-for="n in (columns + 1)" :key="'c-' + n" class="scorecard-skeleton-cell"></div>
            </div>
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
