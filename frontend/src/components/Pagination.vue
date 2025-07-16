<template>
    <div v-if="props.totalPages > 1" class="flex justify-center gap-1 flex-wrap text-sm mt-6">
        <button @click="changePage(1)" :disabled="props.currentPage === 1" class="button-primary">«</button>
        <button @click="changePage(props.currentPage - 1)" :disabled="props.currentPage === 1"
            class="button-primary">‹</button>
        <button v-for="page in paginationRange" :key="page" @click="changePage(page)"
            :class="['button-primary', { 'font-bold underline': page === props.currentPage }]">
            {{ page }}
        </button>
        <button @click="changePage(props.currentPage + 1)" :disabled="props.currentPage === props.totalPages"
            class="button-primary">›</button>
        <button @click="changePage(props.totalPages)" :disabled="props.currentPage === props.totalPages"
            class="button-primary">»</button>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    currentPage: Number,
    totalPages: Number
});

const emit = defineEmits(['update:currentPage']);

function changePage(page) {
    if (page < 1 || page > props.totalPages) return;
    emit('update:currentPage', page);
}

const paginationRange = computed(() => {
    const range = [];
    const start = Math.max(1, props.currentPage - 2);
    const end = Math.min(props.totalPages, props.currentPage + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
});
</script>